import { StoreItem } from './StoreItem';

/** Avatar slots a clothing item can be worn in (the same values as in src/db/schema.sql). */
export const CLOTHING_SLOTS = ['top', 'outer', 'shoes'] as const;
export type ClothingSlot = (typeof CLOTHING_SLOTS)[number];

/** A clothing item for the avatar; it is worn in one slot (FR-2). */
export class ClothingItem implements StoreItem {
  constructor(
    private readonly id: number,
    private readonly name: string,
    private readonly cost: number,
    private readonly tier: number,
    private readonly slot: ClothingSlot,
  ) {}

  getId(): number {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getCost(): number {
    return this.cost;
  }

  getTier(): number {
    return this.tier;
  }

  getSlot(): ClothingSlot {
    return this.slot;
  }
}
