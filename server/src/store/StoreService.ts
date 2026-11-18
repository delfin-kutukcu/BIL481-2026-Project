import { User } from '../models/User';
import { PurchaseCheck } from './PurchaseCheck';
import { StoreItem } from './StoreItem';

/**
 * Business logic of the virtual store (UC3, FR-10).
 * It works only with the StoreItem interface, never with FurnitureItem or ClothingItem.
 *
 * listItems() and buyItem() read and write the database and are added in task 19;
 * buyItem() calls canPurchase() before it deducts the points and adds the item.
 */
export class StoreService {
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
}
