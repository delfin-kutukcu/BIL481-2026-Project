import type { Pool } from 'pg';
import { PgSessionRepository } from '../../src/db/PgSessionRepository';
import { StudySession } from '../../src/models/StudySession';
import { User } from '../../src/models/User';
import { PointService } from '../../src/points/PointService';

// Unit tests without a database: a fake connection records every query and
// answers like PostgreSQL would. The same flow against a real PostgreSQL is in
// sessionRepository.db.test.ts.

type Row = Record<string, unknown>;

class FakeClient {
  readonly queries: { text: string; values: unknown[] }[] = [];
  released = false;

  constructor(private readonly answer: (text: string, values: unknown[]) => Row[]) {}

  async query(text: string, values: unknown[] = []) {
    this.queries.push({ text: text.trim(), values });
    return { rows: this.answer(text.trim(), values) };
  }

  release(): void {
    this.released = true;
  }

  /** First line of each query: 'BEGIN', 'UPDATE users', 'INSERT INTO study_sessions', ... */
  steps(): string[] {
    return this.queries.map((q) => q.text.split('\n')[0].trim());
  }

  valuesOf(firstLine: string): unknown[] {
    const query = this.queries.find((q) => q.text.startsWith(firstLine));
    return query ? query.values : [];
  }
}

/** Answers for a user with the given balances; the new session gets id 7. */
function fakeDatabase(options: { balance?: number; userExists?: boolean; insertFails?: boolean } = {}) {
  const balance = options.balance ?? 0;
  return new FakeClient((text, values) => {
    if (text.startsWith('UPDATE users')) {
      if (options.userExists === false) return [];
      const earned = values[1] as number;
      return [{ points: balance + earned, lifetime_points: balance + earned }];
    }
    if (text.startsWith('INSERT INTO study_sessions')) {
      if (options.insertFails) throw new Error('new row violates check constraint');
      return [{ session_id: 7 }];
    }
    return []; // BEGIN, COMMIT, ROLLBACK
  });
}

const repositoryWith = (client: FakeClient) =>
  new PgSessionRepository({
    connect: async () => client,
    query: (text: string, values: unknown[]) => client.query(text, values),
  } as unknown as Pool);

const finishedAt = new Date('2026-11-20T10:00:00Z');

/** A finished session after PointService.awardPoints(), as StudyTimer.finishTimer() will produce it. */
function awardedSession(activeDurationSec: number, pausedCount = 0): StudySession {
  const session = new StudySession(0, 1, activeDurationSec, finishedAt, pausedCount);
  new PointService().awardPoints(new User(1), session);
  return session;
}

describe('PgSessionRepository.saveFinishedSession (FR-8, FR-16)', () => {
  test('a 30-minute session: the points are added and the session is saved in one transaction', async () => {
    const client = fakeDatabase();
    const saved = await repositoryWith(client).saveFinishedSession(awardedSession(30 * 60, 1));

    expect(saved).toEqual({ sessionId: 7, points: 150, lifetimePoints: 150 });
    expect(client.steps()).toEqual(['BEGIN', 'UPDATE users', 'INSERT INTO study_sessions', 'COMMIT']);
    expect(client.released).toBe(true);
  });

  test('the stored row has the user, active duration, paused count, points and date (FR-7, FR-16)', async () => {
    const client = fakeDatabase();
    await repositoryWith(client).saveFinishedSession(awardedSession(30 * 60, 1));

    expect(client.valuesOf('UPDATE users')).toEqual([1, 150]);
    expect(client.valuesOf('INSERT INTO study_sessions')).toEqual([1, 1800, 1, 150, finishedAt]);
  });

  test('FR-8: a 14-minute session earns 0 points but is still saved', async () => {
    const client = fakeDatabase({ balance: 150 });
    const saved = await repositoryWith(client).saveFinishedSession(awardedSession(14 * 60 + 59));

    expect(saved).toEqual({ sessionId: 7, points: 150, lifetimePoints: 150 });
    expect(client.valuesOf('INSERT INTO study_sessions')).toEqual([1, 899, 0, 0, finishedAt]);
    expect(client.steps()).toEqual(['BEGIN', 'UPDATE users', 'INSERT INTO study_sessions', 'COMMIT']);
  });

  test('an unknown user: an error, no session is saved and the transaction is rolled back', async () => {
    const client = fakeDatabase({ userExists: false });
    const session = new StudySession(0, 99, 30 * 60, finishedAt, 0, 150);

    await expect(repositoryWith(client).saveFinishedSession(session)).rejects.toThrow('User 99 not found');
    expect(client.steps()).toEqual(['BEGIN', 'UPDATE users', 'ROLLBACK']);
    expect(client.released).toBe(true);
  });

  test('if the session cannot be saved, the point update is rolled back too', async () => {
    const client = fakeDatabase({ insertFails: true });

    await expect(repositoryWith(client).saveFinishedSession(awardedSession(30 * 60))).rejects.toThrow('check constraint');
    expect(client.steps()).toEqual(['BEGIN', 'UPDATE users', 'INSERT INTO study_sessions', 'ROLLBACK']);
    expect(client.released).toBe(true);
  });

  test('the points are added to the stored balance, not overwritten (a purchase at the same time is kept)', async () => {
    const client = fakeDatabase();
    await repositoryWith(client).saveFinishedSession(awardedSession(30 * 60));
    const update = client.queries.find((q) => q.text.startsWith('UPDATE users'))!.text;

    expect(update).toMatch(/\bpoints\s*=\s*points \+ \$2/);
    expect(update).toMatch(/\blifetime_points\s*=\s*lifetime_points \+ \$2/);
  });

  test('NFR-3: values are sent as query parameters, not written into the SQL text', async () => {
    const client = fakeDatabase();
    await repositoryWith(client).saveFinishedSession(awardedSession(30 * 60));

    for (const query of client.queries) {
      expect(query.text).not.toMatch(/1800|150/);
    }
  });
});

describe('PgSessionRepository.pointsEarnedToday', () => {
  test("returns today's total as a number (pg returns SUM as a string)", async () => {
    const client = new FakeClient(() => [{ total: '225' }]);

    expect(await repositoryWith(client).pointsEarnedToday(1)).toBe(225);
    expect(client.queries[0].values).toEqual([1]);
  });

  test('no session today gives 0', async () => {
    const client = new FakeClient(() => [{ total: '0' }]);

    expect(await repositoryWith(client).pointsEarnedToday(1)).toBe(0);
  });
});
