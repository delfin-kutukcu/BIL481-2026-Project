import type { Pool, PoolClient } from 'pg';
import { BuyerRecord, ItemRecord, PurchaseTransaction, StoreRepository } from './StoreRepository';

const ITEM_COLUMNS = 'i.item_id, i.name, i.item_type, i.cost, i.tier, i.grid_width, i.grid_height, i.slot';

const ALL_ITEMS_SQL = `
SELECT ${ITEM_COLUMNS}
  FROM items i
 ORDER BY i.item_id`;

const ITEM_BY_ID_SQL = `
SELECT ${ITEM_COLUMNS}
  FROM items i
 WHERE i.item_id = $1`;

const OWNED_ITEMS_SQL = `
SELECT ${ITEM_COLUMNS}
  FROM inventory v
  JOIN items i ON i.item_id = v.item_id
 WHERE v.user_id = $1
 ORDER BY v.acquired_at, i.item_id`;

// FOR UPDATE locks the user's row until the transaction ends. A second purchase
// of the same user waits here and then sees the points and items of the first
// one, so the balance cannot go below 0 and no item is bought twice (NFR-3).
const LOCK_USER_SQL = `
SELECT points, lifetime_points
  FROM users
 WHERE user_id = $1
   FOR UPDATE`;

// Only the spendable points go down; lifetime points, and so the tier, stay the same (FR-9).
const DEDUCT_POINTS_SQL = `
UPDATE users
   SET points = points - $2
 WHERE user_id = $1
RETURNING points`;

const ADD_TO_INVENTORY_SQL = `
INSERT INTO inventory (user_id, item_id)
VALUES ($1, $2)`;

/** Columns of an items row as pg returns them. */
interface ItemRow {
  item_id: number;
  name: string;
  item_type: string;
  cost: number;
  tier: number;
  grid_width: number | null;
  grid_height: number | null;
  slot: string | null;
}

function toItemRecord(row: ItemRow): ItemRecord {
  return {
    type: row.item_type,
    data: {
      id: Number(row.item_id),
      name: row.name,
      cost: Number(row.cost),
      tier: Number(row.tier),
      gridWidth: row.grid_width === null ? null : Number(row.grid_width),
      gridHeight: row.grid_height === null ? null : Number(row.grid_height),
      slot: row.slot,
    },
  };
}

/** The steps of one purchase, all on the same connection (and so in the same transaction). */
class PgPurchaseTransaction implements PurchaseTransaction {
  constructor(private readonly client: PoolClient) {}

  async lockBuyer(userId: number): Promise<BuyerRecord | null> {
    const user = await this.client.query(LOCK_USER_SQL, [userId]);
    if (user.rows.length === 0) {
      return null;
    }
    // Read after the lock, so that a purchase committed meanwhile is included.
    const owned = await this.client.query(OWNED_ITEMS_SQL, [userId]);
    return {
      points: Number(user.rows[0].points),
      lifetimePoints: Number(user.rows[0].lifetime_points),
      ownedItems: owned.rows.map(toItemRecord),
    };
  }

  async findItem(itemId: number): Promise<ItemRecord | null> {
    const result = await this.client.query(ITEM_BY_ID_SQL, [itemId]);
    return result.rows.length === 0 ? null : toItemRecord(result.rows[0]);
  }

  async deductPoints(userId: number, cost: number): Promise<number> {
    const result = await this.client.query(DEDUCT_POINTS_SQL, [userId, cost]);
    return Number(result.rows[0].points);
  }

  async addToInventory(userId: number, itemId: number): Promise<void> {
    await this.client.query(ADD_TO_INVENTORY_SQL, [userId, itemId]);
  }
}

/**
 * PostgreSQL implementation of StoreRepository (tables in src/db/schema.sql).
 *
 * The connection pool is created once by the server and passed in. All values
 * are sent as query parameters ($1, $2, ...) and never written into the SQL
 * text (NFR-3).
 */
export class PgStoreRepository implements StoreRepository {
  constructor(private readonly pool: Pool) {}

  async findAllItems(): Promise<ItemRecord[]> {
    const result = await this.pool.query(ALL_ITEMS_SQL);
    return result.rows.map(toItemRecord);
  }

  async findOwnedItems(userId: number): Promise<ItemRecord[]> {
    const result = await this.pool.query(OWNED_ITEMS_SQL, [userId]);
    return result.rows.map(toItemRecord);
  }

  async inTransaction<T>(work: (tx: PurchaseTransaction) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(new PgPurchaseTransaction(client));
      await client.query('COMMIT');
      return result;
    } catch (error) {
      // Undo every step of the purchase, so nothing is half saved.
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
