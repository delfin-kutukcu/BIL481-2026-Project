import { StoreItem } from './StoreItem';

/**
 * The items a user owns (FR-10). Each item can be owned only once,
 * like the primary key (user_id, item_id) of the inventory table.
 */
export class Inventory {
  private readonly items: StoreItem[] = [];

  constructor(items: StoreItem[] = []) {
    items.forEach((item) => this.add(item));
  }

  add(item: StoreItem): void {
    if (this.owns(item.getId())) {
      throw new Error(`Item ${item.getId()} is already owned`);
    }
    this.items.push(item);
  }

  owns(itemId: number): boolean {
    return this.items.some((item) => item.getId() === itemId);
  }

  /** The owned items in the order they were added. Changing the returned list does not change the inventory. */
  getItems(): StoreItem[] {
    return [...this.items];
  }
}
