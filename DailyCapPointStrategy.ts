import { StudySession } from '../models/StudySession';
import { PointCalculationStrategy } from './PointCalculationStrategy';

/**
 * Optional mitigation for risk R4 (cap points per day). Disabled by default.
 * Applies the wrapped rule, then cuts the result so that the daily total
 * never exceeds dailyCap.
 */
export class DailyCapPointStrategy implements PointCalculationStrategy {
  constructor(
    private readonly base: PointCalculationStrategy,
    private readonly dailyCap: number,
  ) {
    if (dailyCap < 0) {
      throw new Error('dailyCap must not be negative');
    }
  }

  calculatePoints(session: StudySession, pointsEarnedToday: number): number {
    const points = this.base.calculatePoints(session, pointsEarnedToday);
    const remaining = Math.max(0, this.dailyCap - pointsEarnedToday);
    return Math.min(points, remaining);
  }
}
