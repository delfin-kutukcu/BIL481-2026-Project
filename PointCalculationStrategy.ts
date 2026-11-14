import { StudySession } from '../models/StudySession';

/** Strategy interface: one implementation per point rule. */
export interface PointCalculationStrategy {
  calculatePoints(session: StudySession, pointsEarnedToday: number): number;
}
