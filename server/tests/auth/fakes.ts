import { PasswordHasher } from '../../src/auth/PasswordHasher';
import { TokenPayload, TokenService } from '../../src/auth/TokenService';
import { DuplicateUserError, NewUser, UserRecord, UserRepository, UserWithPassword } from '../../src/db/UserRepository';

// Test doubles for the AuthService unit tests (not a test file itself).

/** In-memory users table with the same case-insensitive uniqueness as the database. */
export class FakeUserRepository implements UserRepository {
  readonly rows: UserWithPassword[] = [];

  async create(user: NewUser): Promise<UserRecord> {
    if (this.rows.some((row) => row.username.toLowerCase() === user.username.toLowerCase())) {
      throw new DuplicateUserError('username');
    }
    if (this.rows.some((row) => row.email.toLowerCase() === user.email.toLowerCase())) {
      throw new DuplicateUserError('email');
    }
    const row = { userId: this.rows.length + 1, ...user, points: 0, lifetimePoints: 0 };
    this.rows.push(row);
    const { passwordHash, ...record } = row;
    return record;
  }

  async findByLogin(usernameOrEmail: string): Promise<UserWithPassword | null> {
    const key = usernameOrEmail.toLowerCase();
    const field = key.includes('@') ? 'email' : 'username';
    return this.rows.find((row) => row[field].toLowerCase() === key) ?? null;
  }

  async findById(userId: number): Promise<UserRecord | null> {
    const row = this.rows.find((candidate) => candidate.userId === userId);
    if (!row) return null;
    const { passwordHash, ...record } = row;
    return record;
  }
}

/** Fast stand-in for bcrypt that records how often it was used. */
export class FakeHasher implements PasswordHasher {
  hashCalls = 0;
  verifyCalls = 0;

  async hash(password: string): Promise<string> {
    this.hashCalls++;
    return `fake-hash(${password.split('').reverse().join('')})`;
  }

  async verify(password: string, passwordHash: string): Promise<boolean> {
    this.verifyCalls++;
    return passwordHash === `fake-hash(${password.split('').reverse().join('')})`;
  }
}

/** Token service whose tokens are readable, for unit tests only. */
export class FakeTokens implements TokenService {
  issue(payload: TokenPayload): string {
    return `token:${payload.userId}:${payload.username}`;
  }

  verify(token: string): TokenPayload | null {
    const match = /^token:(\d+):(\w+)$/.exec(token);
    return match ? { userId: Number(match[1]), username: match[2] } : null;
  }
}
