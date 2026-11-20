/**
 * Common interface of everything sold in the virtual store (UC3, FR-10).
 * StoreService works only with this interface, never with a concrete class.
 */
export interface StoreItem {
  getId(): number;
  getName(): string;
  getCost(): number;
  /** Tier needed to buy the item (FR-9). */
  getTier(): number;
}
