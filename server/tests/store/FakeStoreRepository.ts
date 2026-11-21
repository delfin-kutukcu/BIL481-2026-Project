import { ItemRecord, PurchaseTransaction, StoreRepository } from '../../src/db/StoreRepository';

/** The eight items of src/db/seed.sql, with the ids they get in a new database. */
export const SEED_ITEMS: ItemRecord[] = [
  { type: 'furniture', data: { id: 1, name: 'Floor lamp', cost: 80, tier: 1, gridWidth: 1, gridHeight: 1, slot: null } },
  { type: 'furniture', data: { id: 2, name: 'Bookshelf', cost: 120, tier: 1, gridWidth: 2, gridHeight: 1, slot: null } },
  { type: 'furniture', data: { id: 3, name: 'Wooden desk', cost: 300, tier: 2, gridWidth: 2, gridHeight: 1, slot: null } },
  { type: 'furniture', data: { id: 4, name: 'Armchair', cost: 450, tier: 2, gridWidth: 1, gridHeight: 1, slot: null } },
  { type: 'furniture', data: { id: 5, name: 'Grand piano', cost: 3000, tier: 4, gridWidth: 2, gridHeight: 2, slot: null } },
  { type: 'clothing', data: { id: 6, name: 'Hoodie', cost: 60, tier: 1, gridWidth: null, gridHeight: null, slot: 'top' } },
  { type: 'clothing', data: { id: 7, name: 'Sneakers', cost: 200, tier: 2, gridWidth: null, gridHeight: null, slot: 'shoes' } },
  { type: 'clothing', data: { id: 8, name: 'Winter coat', cost: 900, tier: 3, gridWidth: null, gridHeight: null, slot: 'outer' } },
];

interface FakeUser {
  points: number;
  lifetimePoints: number;
  owned: number[];
}

/**
 * In-memory StoreRepository for unit tests (not a test file itself).
 * inTransaction() works on a copy of the users and keeps it only when the
 * work finishes without an error, like a database transaction.
 */
export class FakeStoreRepository implements StoreRepository {
  private users = new Map<number, FakeUser>();

  /** Number of transactions opened so far. */
  transactionCount = 0;

  /** When true, the next addToInventory() fails, to test the rollback. */
  failNextInventoryWrite = false;

  constructor(private readonly items: ItemRecord[] = SEED_ITEMS) {}

  addUser(userId: number, points: number, lifetimePoints: number, owned: number[] = []): this {
    this.users.set(userId, { points, lifetimePoints, owned: [...owned] });
    return this;
  }

  /** The stored state of a user, as the database would hold it. */
  stored(userId: number): FakeUser | undefined {
    const user = this.users.get(userId);
    return user && { ...user, owned: [...user.owned] };
  }

  async findAllItems(): Promise<ItemRecord[]> {
    return [...this.items];
  }

  async findOwnedItems(userId: number): Promise<ItemRecord[]> {
    return (this.users.get(userId)?.owned ?? []).map((id) => this.item(id)!);
  }

  async inTransaction<T>(work: (tx: PurchaseTransaction) => Promise<T>): Promise<T> {
    this.transactionCount++;
    const copy = new Map([...this.users].map(([id, user]) => [id, { ...user, owned: [...user.owned] }]));
    const tx: PurchaseTransaction = {
      lockBuyer: async (userId) => {
        const user = copy.get(userId);
        return user
          ? { points: user.points, lifetimePoints: user.lifetimePoints, ownedItems: user.owned.map((id) => this.item(id)!) }
          : null;
      },
      findItem: async (itemId) => this.item(itemId) ?? null,
      deductPoints: async (userId, cost) => {
        const user = copy.get(userId)!;
        user.points -= cost;
        return user.points;
      },
      addToInventory: async (userId, itemId) => {
        if (this.failNextInventoryWrite) {
          this.failNextInventoryWrite = false;
          throw new Error('insert into inventory failed');
        }
        copy.get(userId)!.owned.push(itemId);
      },
    };
    const result = await work(tx); // an error here drops the copy (rollback)
    this.users = copy; // commit
    return result;
  }

  private item(id: number): ItemRecord | undefined {
    return this.items.find((record) => record.data.id === id);
  }
}
