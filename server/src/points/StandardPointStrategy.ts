import { StudySession } from '../models/StudySession';
import { PointCalculationStrategy } from './PointCalculationStrategy';

/** FR-8: 5 points per active minute for sessions of at least 15 minutes. */
export class StandardPointStrategy implements PointCalculationStrategy {
  private static readonly MIN_ACTIVE_MINUTES = 15;
  private static readonly POINTS_PER_MINUTE = 5;

  calculatePoints(session: StudySession, _pointsEarnedToday: number): number {
    const minutes = session.getActiveMinutes();
    if (minutes < StandardPointStrategy.MIN_ACTIVE_MINUTES) {
      return 0;
    }
    return minutes * StandardPointStrategy.POINTS_PER_MINUTE;
  }
}
