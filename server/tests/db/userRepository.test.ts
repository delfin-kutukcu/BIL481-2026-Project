import type { Pool } from 'pg';
import { PgUserRepository } from '../../src/db/PgUserRepository';
import { DuplicateUserError } from '../../src/db/UserRepository';

// Unit tests without a database: a fake pool records every query and answers
// like PostgreSQL would. The same flows against a real PostgreSQL are in
// userRepository.db.test.ts.

type Row = Record<string, unknown>;

function fakePool(answer: (text: string, values: unknown[]) => Row[]) {
  const queries: { text: string; values: unknown[] }[] = [];
  const pool = {
    query: async (text: string, values: unknown[] = []) => {
      queries.push({ text: text.trim(), values });
      return { rows: answer(text.trim(), values) };
    },
  } as unknown as Pool;
  return { queries, repository: new PgUserRepository(pool) };
}

/** An error like the one pg throws for a unique violation. */
const uniqueViolation = (constraint: string) => Object.assign(new Error('duplicate key value'), { code: '23505', constraint });

const row = { user_id: 5, username: 'student_1', email: 'student@etu.edu.tr', points: 25, lifetime_points: 225 };

describe('PgUserRepository.create (FR-1)', () => {
  test('inserts the username, e-mail, and password hash and returns the new account', async () => {
    const { queries, repository } = fakePool(() => [row]);
    const user = await repository.create({ username: 'student_1', email: 'student@etu.edu.tr', passwordHash: '$2a$10$hash' });

    expect(user).toEqual({ userId: 5, username: 'student_1', email: 'student@etu.edu.tr', points: 25, lifetimePoints: 225 });
    expect(queries[0].text).toMatch(/^INSERT INTO users \(username, email, password_hash\)/);
    expect(queries[0].values).toEqual(['student_1', 'student@etu.edu.tr', '$2a$10$hash']);
  });

  test('a duplicate username or e-mail becomes a DuplicateUserError with the field', async () => {
    for (const [constraint, field] of [['users_username_unique', 'username'], ['users_email_unique', 'email']]) {
      const { repository } = fakePool(() => {
        throw uniqueViolation(constraint);
      });
      const attempt = repository.create({ username: 'a_b', email: 'a@b.cd', passwordHash: 'h' });

      await expect(attempt).rejects.toThrow(DuplicateUserError);
      await expect(attempt).rejects.toMatchObject({ field });
    }
  });

  test('other database errors are passed on unchanged', async () => {
    const { repository } = fakePool(() => {
      throw new Error('connection refused');
    });

    await expect(repository.create({ username: 'a_b', email: 'a@b.cd', passwordHash: 'h' })).rejects.toThrow('connection refused');
  });
});

describe('PgUserRepository.findByLogin (FR-1)', () => {
  test('text with "@" is looked up as e-mail, without regard to letter case', async () => {
    const { queries, repository } = fakePool(() => [{ ...row, password_hash: '$2a$10$hash' }]);
    const user = await repository.findByLogin('Student@ETU.edu.tr');

    expect(user).toEqual({
      userId: 5, username: 'student_1', email: 'student@etu.edu.tr', points: 25, lifetimePoints: 225, passwordHash: '$2a$10$hash',
    });
    expect(queries[0].text).toMatch(/WHERE lower\(email\) = lower\(\$1\)/);
    expect(queries[0].values).toEqual(['Student@ETU.edu.tr']);
  });

  test('other text is looked up as username, without regard to letter case', async () => {
    const { queries, repository } = fakePool(() => []);

    expect(await repository.findByLogin('STUDENT_1')).toBeNull();
    expect(queries[0].text).toMatch(/WHERE lower\(username\) = lower\(\$1\)/);
  });
});

describe('PgUserRepository.findById', () => {
  test('returns the account without the password hash, or null', async () => {
    const found = fakePool(() => [row]);
    const missing = fakePool(() => []);

    expect(await found.repository.findById(5)).toEqual({
      userId: 5, username: 'student_1', email: 'student@etu.edu.tr', points: 25, lifetimePoints: 225,
    });
    expect(found.queries[0].text).not.toMatch(/password_hash/);
    expect(await missing.repository.findById(99)).toBeNull();
  });

  test('NFR-3: values are sent as query parameters, not written into the SQL text', async () => {
    const { queries, repository } = fakePool(() => []);
    await repository.findById(4242);
    await repository.findByLogin("x' OR '1'='1");

    for (const query of queries) {
      expect(query.text).not.toMatch(/4242|OR '1'/);
    }
  });
});
