import type { ItemData } from '../store/ItemData';

/** A row of the items table; item_type decides which class ItemFactory creates. */
export interface ItemRecord {
  type: string;
  data: ItemData;
}

/** The buyer's balances and owned items, read inside a purchase transaction. */
export interface BuyerRecord {
  points: number;
  lifetimePoints: number;
  ownedItems: ItemRecord[];
}

/**
 * The reads and writes of one purchase. They all run in the same database
 * transaction, which StoreRepository.inTransaction() opens and closes.
 */
export interface PurchaseTransaction {
  /**
   * Locks the user's row until the transaction ends, so that two purchases of
   * the same user run one after the other (NFR-3), and returns the user's
   * balances and owned items. Returns null if the user does not exist.
   */
  lockBuyer(userId: number): Promise<BuyerRecord | null>;

  /** The item with this id, or null. */
  findItem(itemId: number): Promise<ItemRecord | null>;

  /** Lowers the spendable points by cost and returns the new balance. Lifetime points do not change. */
  deductPoints(userId: number, cost: number): Promise<number>;

  /** Adds the item to the user's inventory. */
  addToInventory(userId: number, itemId: number): Promise<void>;
}

/**
 * Data access for the virtual store (UC3, FR-10), Repository Pattern.
 * StoreService depends only on this interface; PgStoreRepository is the
 * PostgreSQL implementation, and unit tests use an in-memory fake.
 */
export interface StoreRepository {
  /** All rows of the items table, ordered by item id. */
  findAllItems(): Promise<ItemRecord[]>;

  /** The items the user owns, in the order they were bought. */
  findOwnedItems(userId: number): Promise<ItemRecord[]>;

  /**
   * Runs work in ONE database transaction: it is committed when work returns
   * and rolled back when work throws, so a purchase is saved completely or
   * not at all (Design Document 3.3).
   */
  inTransaction<T>(work: (tx: PurchaseTransaction) => Promise<T>): Promise<T>;
}
