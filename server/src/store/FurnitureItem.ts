import { StoreItem } from './StoreItem';

/** A piece of furniture; it takes gridWidth x gridHeight cells on the apartment grid (FR-11). */
export class FurnitureItem implements StoreItem {
  constructor(
    private readonly id: number,
    private readonly name: string,
    private readonly cost: number,
    private readonly tier: number,
    private readonly gridWidth: number,
    private readonly gridHeight: number,
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

  /** [width, height] in grid cells, for example [2, 1] for the wooden desk. */
  getGridSize(): [number, number] {
    return [this.gridWidth, this.gridHeight];
  }
}
