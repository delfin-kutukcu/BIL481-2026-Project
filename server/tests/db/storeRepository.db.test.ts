import { Pool } from 'pg';
import { PgStoreRepository } from '../../src/db/PgStoreRepository';
import { ClothingItem } from '../../src/store/ClothingItem';
import { FurnitureItem } from '../../src/store/FurnitureItem';
import { PurchaseResult } from '../../src/store/PurchaseResult';
import { StoreService } from '../../src/store/StoreService';

// Integration test against a real PostgreSQL database (QA Plan: integration level).
// It runs only when TEST_DATABASE_URL is set; otherwise it is skipped.
//
//   1. Create the tables once:  npm run db:init
//   2. bash:        TEST_DATABASE_URL=postgres://user:password@localhost:5432/studyloft npm test
//      PowerShell:  $env:TEST_DATABASE_URL="postgres://user:password@localhost:5432/studyloft"; npm test
//
// The test adds its own items (names start with "task19 ") and users (names
// start with task19_), so it does not depend on the seed data, and deletes
// them at the end.

const url = process.env.TEST_DATABASE_URL;
const describeWithDatabase = url ? describe : describe.skip;

describeWithDatabase('StoreService with PgStoreRepository and PostgreSQL (TEST_DATABASE_URL)', () => {
  let pool: Pool;
  let repository: PgStoreRepository;
  let service: StoreService;
  const item: Record<'lamp' | 'shelf' | 'desk' | 'coat', number> = { lamp: 0, shelf: 0, desk: 0, coat: 0 };

  async function deleteTestData(): Promise<void> {
    // Users first: their inventory rows are deleted with them (ON DELETE CASCADE).
    await pool.query("DELETE FROM users WHERE username LIKE 'task19\\_%'");
    await pool.query("DELETE FROM items WHERE name LIKE 'task19 %'");
  }

  beforeAll(async () => {
    pool = new Pool({ connectionString: url });
    repository = new PgStoreRepository(pool);
    service = new StoreService(repository);
    await deleteTestData();

    // Same costs, tiers, and sizes as the seed items Floor lamp, Bookshelf, Wooden desk, and Winter coat.
    const rows: [keyof typeof item, string, number, number, number | null, number | null, string | null][] = [
      ['lamp', 'furniture', 80, 1, 1, 1, null],
      ['shelf', 'furniture', 120, 1, 2, 1, null],
      ['desk', 'furniture', 300, 2, 2, 1, null],
      ['coat', 'clothing', 900, 3, null, null, 'outer'],
    ];
    for (const [key, type, cost, tier, width, height, slot] of rows) {
      const result = await pool.query(
        `INSERT INTO items (name, item_type, cost, tier, grid_width, grid_height, slot)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING item_id`,
        [`task19 ${key}`, type, cost, tier, width, height, slot],
      );
      item[key] = Number(result.rows[0].item_id);
    }
  });

  afterAll(async () => {
    await deleteTestData();
    await pool.end();
  });

  async function createUser(points: number, lifetimePoints: number): Promise<number> {
    const name = `task19_${Date.now()}_${Math.floor(Math.random() * 1000)}`; // username is at most 30 characters
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, points, lifetime_points)
       VALUES ($1, $2, 'not-a-real-hash', $3, $4) RETURNING user_id`,
      [name, `${name}@example.com`, points, lifetimePoints],
    );
    return Number(result.rows[0].user_id);
  }

  async function stored(userId: number) {
    const user = await pool.query('SELECT points, lifetime_points FROM users WHERE user_id = $1', [userId]);
    const owned = await pool.query('SELECT item_id FROM inventory WHERE user_id = $1 ORDER BY item_id', [userId]);
    return {
      points: Number(user.rows[0].points),
      lifetimePoints: Number(user.rows[0].lifetime_points),
      owned: owned.rows.map((row) => Number(row.item_id)),
    };
  }

  const reasons = (results: PurchaseResult[]) =>
    results.map((result) => (result.success ? 'BOUGHT' : result.reason)).sort();

  test('listItems() returns the items as FurnitureItem and ClothingItem objects (Factory Pattern)', async () => {
    const items = await service.listItems();
    const desk = items.find((storeItem) => storeItem.getId() === item.desk);
    const coat = items.find((storeItem) => storeItem.getId() === item.coat);

    expect(desk).toBeInstanceOf(FurnitureItem);
    expect((desk as FurnitureItem).getGridSize()).toEqual([2, 1]);
    expect(coat).toBeInstanceOf(ClothingItem);
    expect((coat as ClothingItem).getSlot()).toBe('outer');
  });

  test('FR-10: with 500 points the 300-point Tier-2 desk is bought and 200 points are left; lifetime points stay 500', async () => {
    const userId = await createUser(500, 500);
    const result = await service.buyItem(userId, item.desk);

    expect(result.success && result.newBalance).toBe(200);
    expect(await stored(userId)).toEqual({ points: 200, lifetimePoints: 500, owned: [item.desk] });
    expect((await service.listInventory(userId)).map((owned) => owned.getId())).toEqual([item.desk]);
  });

  test('FR-10: with 100 points the same purchase is rejected and nothing changes', async () => {
    const userId = await createUser(100, 500);

    expect(await service.buyItem(userId, item.desk)).toEqual({ success: false, reason: 'NOT_ENOUGH_POINTS' });
    expect(await stored(userId)).toEqual({ points: 100, lifetimePoints: 500, owned: [] });
  });

  test('FR-9: an item of a locked tier is rejected even with enough points', async () => {
    const userId = await createUser(950, 950);

    expect(await service.buyItem(userId, item.coat)).toEqual({ success: false, reason: 'TIER_LOCKED' });
    expect(await stored(userId)).toEqual({ points: 950, lifetimePoints: 950, owned: [] });
  });

  test('NFR-3, QA TC-05: two purchases of the same item at the same time; exactly one succeeds', async () => {
    const userId = await createUser(150, 150);
    const results = await Promise.all([service.buyItem(userId, item.shelf), service.buyItem(userId, item.shelf)]);

    expect(reasons(results)).toEqual(['ALREADY_OWNED', 'BOUGHT']);
    expect(await stored(userId)).toEqual({ points: 30, lifetimePoints: 150, owned: [item.shelf] });
  });

  test('NFR-3: two purchases at the same time that together cost more than the points; the balance never goes below 0', async () => {
    const userId = await createUser(150, 150);
    const results = await Promise.all([service.buyItem(userId, item.lamp), service.buyItem(userId, item.shelf)]);
    const after = await stored(userId);

    expect(reasons(results)).toEqual(['BOUGHT', 'NOT_ENOUGH_POINTS']);
    expect(after.owned).toHaveLength(1);
    expect(after.points).toBe(after.owned[0] === item.lamp ? 70 : 30);
  });

  test('an unknown item id is rejected and nothing changes', async () => {
    const userId = await createUser(500, 500);
    const max = await pool.query('SELECT COALESCE(MAX(item_id), 0) + 1000 AS id FROM items');

    expect(await service.buyItem(userId, Number(max.rows[0].id))).toEqual({ success: false, reason: 'ITEM_NOT_FOUND' });
    expect(await stored(userId)).toEqual({ points: 500, lifetimePoints: 500, owned: [] });
  });

  test('if a step fails after the point deduction, the deduction is rolled back', async () => {
    const userId = await createUser(500, 500);

    await expect(
      repository.inTransaction(async (tx) => {
        await tx.deductPoints(userId, 300);
        throw new Error('stopped after the deduction');
      }),
    ).rejects.toThrow('stopped after the deduction');
    expect(await stored(userId)).toEqual({ points: 500, lifetimePoints: 500, owned: [] });
  });
});
