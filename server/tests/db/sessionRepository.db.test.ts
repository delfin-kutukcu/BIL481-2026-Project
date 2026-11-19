import { Pool } from 'pg';
import { PgSessionRepository } from '../../src/db/PgSessionRepository';
import { StudySession } from '../../src/models/StudySession';
import { User } from '../../src/models/User';
import { PointService } from '../../src/points/PointService';

// Integration test against a real PostgreSQL database (QA Plan: integration level).
// It runs only when TEST_DATABASE_URL is set; otherwise it is skipped, so
// `npm test` also works without a database.
//
//   1. Create the tables once:  npm run db:init
//   2. bash:        TEST_DATABASE_URL=postgres://user:password@localhost:5432/studyloft npm test
//      PowerShell:  $env:TEST_DATABASE_URL="postgres://user:password@localhost:5432/studyloft"; npm test
//
// The test creates its own users (username starts with task15_) and deletes
// them at the end; their sessions are deleted with them (ON DELETE CASCADE).

const url = process.env.TEST_DATABASE_URL;
const describeWithDatabase = url ? describe : describe.skip;

describeWithDatabase('PgSessionRepository with PostgreSQL (TEST_DATABASE_URL)', () => {
  let pool: Pool;
  let repository: PgSessionRepository;
  const pointService = new PointService();

  beforeAll(() => {
    pool = new Pool({ connectionString: url });
    repository = new PgSessionRepository(pool);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE username LIKE 'task15\\_%'");
    await pool.end();
  });

  async function createUser(points = 0, lifetimePoints = 0): Promise<number> {
    const name = `task15_${Date.now()}_${Math.floor(Math.random() * 1000)}`; // username is at most 30 characters
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, points, lifetime_points)
       VALUES ($1, $2, 'not-a-real-hash', $3, $4) RETURNING user_id`,
      [name, `${name}@example.com`, points, lifetimePoints],
    );
    return Number(result.rows[0].user_id);
  }

  async function loadUser(userId: number): Promise<User> {
    const result = await pool.query('SELECT points, lifetime_points FROM users WHERE user_id = $1', [userId]);
    return new User(userId, Number(result.rows[0].points), Number(result.rows[0].lifetime_points));
  }

  async function balances(userId: number) {
    const user = await loadUser(userId);
    return { points: user.getPoints(), lifetimePoints: user.getLifetimePoints() };
  }

  /** [active_duration_sec, paused_count, points_earned] of each stored session, oldest first. */
  async function storedSessions(userId: number): Promise<number[][]> {
    const result = await pool.query(
      `SELECT active_duration_sec, paused_count, points_earned
         FROM study_sessions WHERE user_id = $1 ORDER BY session_id`,
      [userId],
    );
    return result.rows.map((row) => [
      Number(row.active_duration_sec),
      Number(row.paused_count),
      Number(row.points_earned),
    ]);
  }

  /** The finish steps of the Use Case 2 / Use Case 4 sequence diagrams. */
  async function finishSession(userId: number, activeDurationSec: number, pausedCount = 0) {
    const user = await loadUser(userId);
    const session = new StudySession(0, userId, activeDurationSec, new Date(), pausedCount);
    const result = pointService.awardPoints(user, session, await repository.pointsEarnedToday(userId));
    const saved = await repository.saveFinishedSession(session);
    return { session, result, saved };
  }

  test('Design Document 3.4 example: 30 min -> 150, 14 min -> 0 but saved, 15 min -> 75 and Tier 2 (FR-8, FR-9, FR-16)', async () => {
    const userId = await createUser();

    const first = await finishSession(userId, 30 * 60, 1);
    expect(first.result).toEqual({ earnedPoints: 150, newBalance: 150, newTier: 1, tierUnlocked: false });
    expect(first.saved).toMatchObject({ points: 150, lifetimePoints: 150 });

    const second = await finishSession(userId, 14 * 60 + 59);
    expect(second.result.earnedPoints).toBe(0);

    const third = await finishSession(userId, 15 * 60);
    expect(third.result).toEqual({ earnedPoints: 75, newBalance: 225, newTier: 2, tierUnlocked: true });

    expect(await balances(userId)).toEqual({ points: 225, lifetimePoints: 225 });
    expect(await storedSessions(userId)).toEqual([
      [1800, 1, 150],
      [899, 0, 0],
      [900, 0, 75],
    ]);
    expect(await repository.pointsEarnedToday(userId)).toBe(225);
  });

  test('FR-16: the session id and the date are stored', async () => {
    const userId = await createUser();
    const { session, saved } = await finishSession(userId, 20 * 60);

    const result = await pool.query('SELECT user_id, finished_at FROM study_sessions WHERE session_id = $1', [
      saved.sessionId,
    ]);
    expect(Number(result.rows[0].user_id)).toBe(userId);
    expect(new Date(result.rows[0].finished_at).getTime()).toBe(session.date.getTime());
  });

  test('if the session cannot be saved, the points are not added either (rollback)', async () => {
    const userId = await createUser(100, 100);
    // A negative duration breaks the CHECK constraint of study_sessions after the point update.
    const broken = new StudySession(0, userId, -1, new Date(), 0, 50);

    await expect(repository.saveFinishedSession(broken)).rejects.toThrow();
    expect(await balances(userId)).toEqual({ points: 100, lifetimePoints: 100 });
    expect(await storedSessions(userId)).toEqual([]);
  });

  test('an unknown user: an error and no session row', async () => {
    const result = await pool.query('SELECT COALESCE(MAX(user_id), 0) + 1000 AS id FROM users');
    const missingId = Number(result.rows[0].id);

    await expect(
      repository.saveFinishedSession(new StudySession(0, missingId, 30 * 60, new Date(), 0, 150)),
    ).rejects.toThrow(`User ${missingId} not found`);
    expect(await storedSessions(missingId)).toEqual([]);
  });

  test('NFR-3: a purchase saved at the same time is not lost', async () => {
    const userId = await createUser(500, 500);
    const purchase = await pool.connect();
    try {
      // An open purchase transaction (300-point desk) holds the user's row ...
      await purchase.query('BEGIN');
      await purchase.query('UPDATE users SET points = points - 300 WHERE user_id = $1', [userId]);

      // ... so saving the session waits until the purchase is committed.
      const saving = repository.saveFinishedSession(new StudySession(0, userId, 30 * 60, new Date(), 0, 150));
      await purchase.query('COMMIT');

      expect(await saving).toMatchObject({ points: 350, lifetimePoints: 650 });
    } finally {
      await purchase.query('ROLLBACK'); // does nothing after COMMIT; ends the transaction if the test failed early
      purchase.release();
    }
    expect(await balances(userId)).toEqual({ points: 350, lifetimePoints: 650 });
  });
});
