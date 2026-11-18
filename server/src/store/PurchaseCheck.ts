/**
 * Why a purchase is not allowed. Each reason matches a card state of the
 * store wireframe: Owned, "Tier N required", and "Not enough points".
 */
export type PurchaseRejection = 'ALREADY_OWNED' | 'TIER_LOCKED' | 'NOT_ENOUGH_POINTS';

/** Result of StoreService.canPurchase(). */
export type PurchaseCheck =
  | { allowed: true }
  | { allowed: false; reason: PurchaseRejection };
