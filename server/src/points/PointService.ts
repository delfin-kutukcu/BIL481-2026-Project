import { StudySession } from '../models/StudySession';
import { User } from '../models/User';
import { PointCalculationStrategy } from './PointCalculationStrategy';
import { PointResult } from './PointResult';
import { StandardPointStrategy } from './StandardPointStrategy';
import { TierPolicy } from './TierPolicy';

/**
 * Context of the Strategy Pattern. Called when a study session finishes (UC2).
 * It does not know which rule is active; it only calls the strategy interface.
 */
export class PointService {
  constructor(
    private strategy: PointCalculationStrategy = new StandardPointStrategy(),
    private readonly tierPolicy: TierPolicy = new TierPolicy(),
  ) {}

  setStrategy(strategy: PointCalculationStrategy): void {
    this.strategy = strategy;
  }

  awardPoints(user: User, session: StudySession, pointsEarnedToday: number = 0): PointResult {
    const oldTier = this.tierPolicy.getTier(user.getLifetimePoints());

    const earned = this.strategy.calculatePoints(session, pointsEarnedToday);
    if (earned > 0) {
      user.addPoints(earned);
    }
    session.pointsEarned = earned; // the session is saved even when 0 points (FR-8, FR-16)

    const newTier = this.tierPolicy.getTier(user.getLifetimePoints());
    return {
      earnedPoints: earned,
      newBalance: user.getPoints(),
      newTier,
      tierUnlocked: newTier > oldTier,
    };
  }
}
