import type { Pool } from 'pg';
import { DuplicateUserError, NewUser, UserRecord, UserRepository, UserWithPassword } from './UserRepository';

const USER_COLUMNS = 'user_id, username, email, points, lifetime_points';

const INSERT_USER_SQL = `
INSERT INTO users (username, email, password_hash)
VALUES ($1, $2, $3)
RETURNING ${USER_COLUMNS}`;

// lower(...) matches the case-insensitive unique indexes, so these lookups use them.
const FIND_BY_EMAIL_SQL = `
SELECT ${USER_COLUMNS}, password_hash
  FROM users
 WHERE lower(email) = lower($1)`;

const FIND_BY_USERNAME_SQL = `
SELECT ${USER_COLUMNS}, password_hash
  FROM users
 WHERE lower(username) = lower($1)`;

const FIND_BY_ID_SQL = `
SELECT ${USER_COLUMNS}
  FROM users
 WHERE user_id = $1`;

/** PostgreSQL error code of a unique violation, and the unique indexes of src/db/schema.sql. */
const UNIQUE_VIOLATION = '23505';
const DUPLICATE_FIELD_BY_INDEX: Record<string, 'username' | 'email'> = {
  users_username_unique: 'username',
  users_email_unique: 'email',
};

interface UserRow {
  user_id: number;
  username: string;
  email: string;
  points: number;
  lifetime_points: number;
  password_hash?: string;
}

function toUserRecord(row: UserRow): UserRecord {
  return {
    userId: Number(row.user_id),
    username: row.username,
    email: row.email,
    points: Number(row.points),
    lifetimePoints: Number(row.lifetime_points),
  };
}

/**
 * PostgreSQL implementation of UserRepository (users table in src/db/schema.sql).
 * The connection pool is created once by the server and passed in. All values
 * are sent as query parameters, never written into the SQL text (NFR-3).
 */
export class PgUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async create(user: NewUser): Promise<UserRecord> {
    try {
      const result = await this.pool.query(INSERT_USER_SQL, [user.username, user.email, user.passwordHash]);
      return toUserRecord(result.rows[0]);
    } catch (error) {
      // The database decides about duplicates, so two registrations at the same time cannot both succeed.
      const { code, constraint } = (error ?? {}) as { code?: string; constraint?: string };
      const field = code === UNIQUE_VIOLATION && constraint ? DUPLICATE_FIELD_BY_INDEX[constraint] : undefined;
      if (field) {
        throw new DuplicateUserError(field);
      }
      throw error;
    }
  }

  async findByLogin(usernameOrEmail: string): Promise<UserWithPassword | null> {
    // A username cannot contain "@" (registrationRules), so "@" means an e-mail address.
    const sql = usernameOrEmail.includes('@') ? FIND_BY_EMAIL_SQL : FIND_BY_USERNAME_SQL;
    const result = await this.pool.query(sql, [usernameOrEmail]);
    if (result.rows.length === 0) {
      return null;
    }
    const row: UserRow = result.rows[0];
    return { ...toUserRecord(row), passwordHash: String(row.password_hash) };
  }

  async findById(userId: number): Promise<UserRecord | null> {
    const result = await this.pool.query(FIND_BY_ID_SQL, [userId]);
    return result.rows.length === 0 ? null : toUserRecord(result.rows[0]);
  }
}
