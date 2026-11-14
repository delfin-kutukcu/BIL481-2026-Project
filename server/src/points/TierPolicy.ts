/**
 * Maps lifetime points to a furniture tier (FR-9).
 * thresholds[i] is the lifetime points needed for Tier i+1.
 */
export class TierPolicy {
  constructor(private readonly thresholds: number[] = [0, 200, 1000, 3000]) {}

  getTier(lifetimePoints: number): number {
    let tier = 1;
    for (let i = 0; i < this.thresholds.length; i++) {
      if (lifetimePoints >= this.thresholds[i]) {
        tier = i + 1;
      }
    }
    return tier;
  }
}
