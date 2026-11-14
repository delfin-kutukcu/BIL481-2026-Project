/** What the user sees after a session, e.g. "+150 points, Tier 2 unlocked". */
export interface PointResult {
  earnedPoints: number;
  newBalance: number;
  newTier: number;
  tierUnlocked: boolean;
}
