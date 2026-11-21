import { PurchaseRejection } from './PurchaseCheck';
import { StoreItem } from './StoreItem';

/**
 * Why StoreService.buyItem() did not buy: one of the canPurchase() reasons,
 * or ITEM_NOT_FOUND when no item has the given id.
 */
export type PurchaseFailure = PurchaseRejection | 'ITEM_NOT_FOUND';

/**
 * Result of StoreService.buyItem() (Design Document 3.3, steps 4 and 5).
 * On success it holds the new balance and the inventory; on failure nothing
 * has changed and the reason says why.
 */
export type PurchaseResult =
  | { success: true; newBalance: number; inventory: StoreItem[] }
  | { success: false; reason: PurchaseFailure };
