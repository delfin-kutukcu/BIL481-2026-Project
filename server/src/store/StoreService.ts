import { ItemRecord, StoreRepository } from '../db/StoreRepository';
import { User } from '../models/User';
import { Inventory } from './Inventory';
import { ItemFactory } from './ItemFactory';
import { PurchaseCheck } from './PurchaseCheck';
import { PurchaseResult } from './PurchaseResult';
import { StoreItem } from './StoreItem';

/**
 * Business logic of the virtual store (UC3, FR-10).
 * It works only with the StoreItem interface, never with FurnitureItem or
 * ClothingItem: ItemFactory turns every database record into a StoreItem.
 * The database is reached only through the StoreRepository interface.
 */
export class StoreService {
  constructor(
    private readonly repository: StoreRepository,
    private readonly factory: ItemFactory = new ItemFactory(),
  ) {}

  /** The store catalogue (Design Document 3.3, step 1; GET /api/store/items). */
  async listItems(): Promise<StoreItem[]> {
    const records = await this.repository.findAllItems();
    return records.map((record) => this.toItem(record));
  }

  /** The items the user owns (GET /api/inventory). */
  async listInventory(userId: number): Promise<StoreItem[]> {
    const records = await this.repository.findOwnedItems(userId);
    return records.map((record) => this.toItem(record));
  }

  /**
   * Buys an item for the user (Design Document 3.3, steps 3 to 5; POST /api/store/buy).
   *
   * Everything runs in one database transaction with the user's row locked:
   * canPurchase() decides with the current points and inventory, then the
   * points are deducted and the item is added. If the purchase is not allowed
   * or a step fails, nothing changes. Throws if the user does not exist.
   */
  async buyItem(userId: number, itemId: number): Promise<PurchaseResult> {
    // An id that is not a positive whole number cannot exist in the items table.
    if (!Number.isInteger(itemId) || itemId <= 0) {
      return { success: false, reason: 'ITEM_NOT_FOUND' };
    }

    return this.repository.inTransaction(async (tx): Promise<PurchaseResult> => {
      const buyer = await tx.lockBuyer(userId);
      if (buyer === null) {
        throw new Error(`User ${userId} not found`);
      }
      const record = await tx.findItem(itemId);
      if (record === null) {
        return { success: false, reason: 'ITEM_NOT_FOUND' };
      }

      const item = this.toItem(record);
      const owned = new Inventory(buyer.ownedItems.map((ownedRecord) => this.toItem(ownedRecord)));
      const user = new User(userId, buyer.points, buyer.lifetimePoints, owned);

      const check = this.canPurchase(user, item);
      if (!check.allowed) {
        return { success: false, reason: check.reason };
      }

      user.deductPoints(item.getCost());
      user.getInventory().add(item);
      const newBalance = await tx.deductPoints(userId, item.getCost());
      await tx.addToInventory(userId, itemId);
      return { success: true, newBalance, inventory: user.getInventory().getItems() };
    });
  }

  /**
   * Checks the purchase rules of FR-10 in the order of Design Document 3.3:
   * 1. the item is not owned yet, 2. its tier is unlocked (FR-9),
   * 3. its cost does not exceed the user's points.
   * Nothing is changed by this check.
   */
  canPurchase(user: User, item: StoreItem): PurchaseCheck {
    if (user.getInventory().owns(item.getId())) {
      return { allowed: false, reason: 'ALREADY_OWNED' };
    }
    if (item.getTier() > user.getTier()) {
      return { allowed: false, reason: 'TIER_LOCKED' };
    }
    if (item.getCost() > user.getPoints()) {
      return { allowed: false, reason: 'NOT_ENOUGH_POINTS' };
    }
    return { allowed: true };
  }

  private toItem(record: ItemRecord): StoreItem {
    return this.factory.createItem(record.type, record.data);
  }
}
