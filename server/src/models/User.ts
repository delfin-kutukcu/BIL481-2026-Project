import { TierPolicy } from '../points/TierPolicy';
import { Inventory } from '../store/Inventory';

/**
 * points: spendable balance (decreases when buying, UC3).
 * lifetimePoints: all points ever earned; only increases, decides the tier (FR-9).
 * inventory: the items the user owns (UC3). Load it together with the user
 * from the database; a new user starts with an empty inventory.
 */
export class User {
  constructor(
    public readonly userId: number,
    private points: number = 0,
    private lifetimePoints: number = 0,
    private readonly inventory: Inventory = new Inventory(),
    private readonly tierPolicy: TierPolicy = new TierPolicy(),
  ) {}

  addPoints(amount: number): void {
    if (amount < 0) {
      throw new Error('Amount must not be negative');
    }
    this.points += amount;
    this.lifetimePoints += amount;
  }

  deductPoints(cost: number): void {
    if (cost < 0 || cost > this.points) {
      throw new Error('Not enough points');
    }
    this.points -= cost;
  }

  getPoints(): number {
    return this.points;
  }

  getLifetimePoints(): number {
    return this.lifetimePoints;
  }

  getTier(): number {
    return this.tierPolicy.getTier(this.lifetimePoints);
  }

  getInventory(): Inventory {
    return this.inventory;
  }
}
