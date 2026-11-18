import { CLOTHING_SLOTS, ClothingItem, ClothingSlot } from './ClothingItem';
import { FurnitureItem } from './FurnitureItem';
import { ItemData } from './ItemData';
import { StoreItem } from './StoreItem';

/**
 * Factory Pattern (UC3): turns an item record into the matching StoreItem.
 * The type comes from the item_type column of the items table.
 * A new product type needs one new class and one new branch here;
 * StoreService does not change (Open/Closed Principle).
 */
export class ItemFactory {
  createItem(type: string, data: ItemData): StoreItem {
    switch (type) {
      case 'furniture':
        return this.createFurniture(data);
      case 'clothing':
        return this.createClothing(data);
      default:
        throw new Error(`Unknown item type: ${type}`);
    }
  }

  private createFurniture(data: ItemData): FurnitureItem {
    const { gridWidth, gridHeight } = data;
    if (!isPositiveInteger(gridWidth) || !isPositiveInteger(gridHeight)) {
      throw new Error(`Furniture "${data.name}" needs a positive grid size`);
    }
    return new FurnitureItem(data.id, data.name, data.cost, data.tier, gridWidth, gridHeight);
  }

  private createClothing(data: ItemData): ClothingItem {
    const { slot } = data;
    if (!isClothingSlot(slot)) {
      throw new Error(`Clothing "${data.name}" needs a slot (${CLOTHING_SLOTS.join(', ')})`);
    }
    return new ClothingItem(data.id, data.name, data.cost, data.tier, slot);
  }
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isClothingSlot(value: unknown): value is ClothingSlot {
  return typeof value === 'string' && (CLOTHING_SLOTS as readonly string[]).includes(value);
}
