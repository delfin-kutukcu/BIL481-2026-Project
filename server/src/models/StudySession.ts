/**
 * A finished study session (FR-6, FR-16).
 * activeDurationSec = elapsed time minus manual and automatic pause time.
 */
export class StudySession {
  constructor(
    public readonly sessionId: number,
    public readonly userId: number,
    public readonly activeDurationSec: number,
    public readonly date: Date,
    public readonly pausedCount: number,
    public pointsEarned: number = 0,
  ) {}

  /** Whole active minutes, rounded down (14 min 59 s counts as 14). */
  getActiveMinutes(): number {
    return Math.floor(this.activeDurationSec / 60);
  }
}
