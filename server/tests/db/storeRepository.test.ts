import type { Pool } from 'pg';
import { PgStoreRepository } from '../../src/db/PgStoreRepository';

// Unit tests without a database: a fake connection records every query and
// answers like PostgreSQL would. The same flows against a real PostgreSQL are
// in storeRepository.db.test.ts.

type Row = Record<string, unknown>;

class FakeClient {
  readonly queries: { text: string; values: unknown[] }[] = [];
  released = false;

  constructor(private readonly answer: (text: string, values: unknown[]) => Row[] = () => []) {}

  async query(text: string, values: unknown[] = []) {
    this.queries.push({ text: text.trim(), values });
    return { rows: this.answer(text.trim(), values) };
  }

  release(): void {
    this.released = true;
  }

  /** The first line of each query, for example 'BEGIN' or 'UPDATE users'. */
  steps(): string[] {
    return this.queries.map((q) => q.text.split('\n')[0].trim());
  }
}

const repositoryWith = (client: FakeClient) =>
  new PgStoreRepository({
    connect: async () => client,
    query: (text: string, values: unknown[]) => client.query(text, values),
  } as unknown as Pool);

const deskRow = {
  item_id: 3, name: 'Wooden desk', item_type: 'furniture', cost: 300, tier: 2, grid_width: 2, grid_height: 1, slot: null,
};
const coatRow = {
  item_id: 8, name: 'Winter coat', item_type: 'clothing', cost: 900, tier: 3, grid_width: null, grid_height: null, slot: 'outer',
};

describe('PgStoreRepository: reading items', () => {
  test('findAllItems() turns the rows into records for ItemFactory, ordered by item id', async () => {
    const client = new FakeClient(() => [deskRow, coatRow]);
    const records = await repositoryWith(client).findAllItems();

    expect(records).toEqual([
      { type: 'furniture', data: { id: 3, name: 'Wooden desk', cost: 300, tier: 2, gridWidth: 2, gridHeight: 1, slot: null } },
      { type: 'clothing', data: { id: 8, name: 'Winter coat', cost: 900, tier: 3, gridWidth: null, gridHeight: null, slot: 'outer' } },
    ]);
    expect(client.queries[0].text).toMatch(/ORDER BY i\.item_id/);
  });

  test("findOwnedItems() reads the user's inventory in the order of purchase", async () => {
    const client = new FakeClient(() => [deskRow]);
    const records = await repositoryWith(client).findOwnedItems(7);

    expect(records.map((record) => record.data.name)).toEqual(['Wooden desk']);
    expect(client.queries[0].values).toEqual([7]);
    expect(client.queries[0].text).toMatch(/FROM inventory v/);
    expect(client.queries[0].text).toMatch(/ORDER BY v\.acquired_at/);
  });
});

describe('PgStoreRepository.inTransaction (Design Document 3.3: one transaction)', () => {
  test('the steps of a purchase run between BEGIN and COMMIT on one connection', async () => {
    const client = new FakeClient((text) => {
      if (text.startsWith('SELECT points')) return [{ points: 500, lifetime_points: 500 }];
      if (text.startsWith('UPDATE users')) return [{ points: 200 }];
      return [];
    });

    const newBalance = await repositoryWith(client).inTransaction(async (tx) => {
      await tx.lockBuyer(1);
      const balance = await tx.deductPoints(1, 300);
      await tx.addToInventory(1, 3);
      return balance;
    });

    expect(newBalance).toBe(200);
    expect(client.steps()).toEqual(['BEGIN', 'SELECT points, lifetime_points', 'SELECT i.item_id, i.name, i.item_type, i.cost, i.tier, i.grid_width, i.grid_height, i.slot', 'UPDATE users', 'INSERT INTO inventory (user_id, item_id)', 'COMMIT']);
    expect(client.released).toBe(true);
  });

  test('if a step fails, the transaction is rolled back and the error is passed on', async () => {
    const client = new FakeClient((text) => {
      if (text.startsWith('INSERT INTO inventory')) throw new Error('duplicate key value violates unique constraint');
      if (text.startsWith('UPDATE users')) return [{ points: 200 }];
      return [];
    });

    await expect(
      repositoryWith(client).inTransaction(async (tx) => {
        await tx.deductPoints(1, 300);
        await tx.addToInventory(1, 3);
      }),
    ).rejects.toThrow('duplicate key');
    expect(client.steps()).toEqual(['BEGIN', 'UPDATE users', 'INSERT INTO inventory (user_id, item_id)', 'ROLLBACK']);
    expect(client.released).toBe(true);
  });
});

describe('PgStoreRepository: the steps of a purchase', () => {
  test("lockBuyer() locks the user's row first (FOR UPDATE) and then reads the owned items (NFR-3)", async () => {
    const client = new FakeClient((text) =>
      text.startsWith('SELECT points') ? [{ points: 500, lifetime_points: 600 }] : [deskRow],
    );
    const buyer = await repositoryWith(client).inTransaction((tx) => tx.lockBuyer(1));

    expect(buyer).toEqual({
      points: 500,
      lifetimePoints: 600,
      ownedItems: [{ type: 'furniture', data: { id: 3, name: 'Wooden desk', cost: 300, tier: 2, gridWidth: 2, gridHeight: 1, slot: null } }],
    });
    expect(client.queries[1].text).toMatch(/FOR UPDATE/);
    expect(client.queries[2].text).toMatch(/FROM inventory v/);
  });

  test('lockBuyer() returns null for an unknown user and reads nothing else', async () => {
    const client = new FakeClient(() => []);

    expect(await repositoryWith(client).inTransaction((tx) => tx.lockBuyer(99))).toBeNull();
    expect(client.steps()).toEqual(['BEGIN', 'SELECT points, lifetime_points', 'COMMIT']);
  });

  test('findItem() returns the record, or null for an unknown id', async () => {
    const found = new FakeClient(() => [coatRow]);
    const missing = new FakeClient(() => []);

    expect((await repositoryWith(found).inTransaction((tx) => tx.findItem(8)))?.data.slot).toBe('outer');
    expect(await repositoryWith(missing).inTransaction((tx) => tx.findItem(999))).toBeNull();
    expect(found.queries[1].values).toEqual([8]);
  });

  test('deductPoints() lowers only the spendable points and returns the new balance (FR-9)', async () => {
    const client = new FakeClient((text) => (text.startsWith('UPDATE users') ? [{ points: 200 }] : []));
    const balance = await repositoryWith(client).inTransaction((tx) => tx.deductPoints(1, 300));
    const update = client.queries[1];

    expect(balance).toBe(200);
    expect(update.values).toEqual([1, 300]);
    expect(update.text).toMatch(/SET points = points - \$2/);
    expect(update.text).not.toMatch(/lifetime_points/);
  });

  test('NFR-3: ids and costs are sent as query parameters, not written into the SQL text', async () => {
    const client = new FakeClient((text) => {
      if (text.startsWith('SELECT points')) return [{ points: 500, lifetime_points: 500 }];
      if (text.startsWith('UPDATE users')) return [{ points: 200 }];
      return [];
    });
    await repositoryWith(client).inTransaction(async (tx) => {
      await tx.lockBuyer(41);
      await tx.findItem(43);
      await tx.deductPoints(41, 300);
      await tx.addToInventory(41, 43);
    });

    for (const query of client.queries) {
      expect(query.text).not.toMatch(/41|43|300/);
    }
  });
});
