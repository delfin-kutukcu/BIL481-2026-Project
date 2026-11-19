import type { Pool } from 'pg';
import { StudySession } from '../models/StudySession';
import { SavedSession, SessionRepository } from './SessionRepository';

// Points are ADDED to the stored balance instead of being overwritten with a
// value computed earlier, so a purchase saved at the same time is not lost (NFR-3).
// Both balances grow by the same amount, so points <= lifetime_points still holds.
const ADD_POINTS_SQL = `
UPDATE users
   SET points          = points + $2,
       lifetime_points = lifetime_points + $2
 WHERE user_id = $1
RETURNING points, lifetime_points`;

const INSERT_SESSION_SQL = `
INSERT INTO study_sessions
       (user_id, active_duration_sec, paused_count, points_earned, finished_at)
VALUES ($1, $2, $3, $4, $5)
RETURNING session_id`;

// "Today" starts at midnight in the time zone of the database connection
// (PostgreSQL's TimeZone setting).
const POINTS_EARNED_TODAY_SQL = `
SELECT COALESCE(SUM(points_earned), 0) AS total
  FROM study_sessions
 WHERE user_id = $1
   AND finished_at >= date_trunc('day', now())`;

/**
 * PostgreSQL implementation of SessionRepository (tables in src/db/schema.sql).
 *
 * The connection pool is created once by the server and passed in, so this
 * class does not read DATABASE_URL itself. All values are sent as query
 * parameters ($1, $2, ...) and never written into the SQL text (NFR-3).
 */
export class PgSessionRepository implements SessionRepository {
  constructor(private readonly pool: Pool) {}

  async pointsEarnedToday(userId: number): Promise<number> {
    const result = await this.pool.query(POINTS_EARNED_TODAY_SQL, [userId]);
    // SUM() returns a bigint, which pg gives as a string.
    return Number(result.rows[0].total);
  }

  async saveFinishedSession(session: StudySession): Promise<SavedSession> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Updating the row also locks it until COMMIT or ROLLBACK.
      const user = await client.query(ADD_POINTS_SQL, [session.userId, session.pointsEarned]);
      if (user.rows.length === 0) {
        throw new Error(`User ${session.userId} not found`);
      }

      const saved = await client.query(INSERT_SESSION_SQL, [
        session.userId,
        session.activeDurationSec,
        session.pausedCount,
        session.pointsEarned,
        session.date,
      ]);

      await client.query('COMMIT');
      return {
        sessionId: Number(saved.rows[0].session_id),
        points: Number(user.rows[0].points),
        lifetimePoints: Number(user.rows[0].lifetime_points),
      };
    } catch (error) {
      // Undo the point update if anything failed, so nothing is half saved.
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
