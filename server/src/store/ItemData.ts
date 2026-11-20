/**
 * One row of the items table (src/db/schema.sql) as ItemFactory receives it.
 * Furniture rows have gridWidth and gridHeight; clothing rows have a slot.
 * Columns that do not apply to the item type are null in the database.
 */
export interface ItemData {
  id: number;
  name: string;
  cost: number;
  tier: number;
  gridWidth?: number | null;
  gridHeight?: number | null;
  slot?: string | null;
}
