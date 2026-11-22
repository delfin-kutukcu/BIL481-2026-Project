import { DuplicateUserError, UserRecord, UserRepository } from '../db/UserRepository';
import { TierPolicy } from '../points/TierPolicy';
import { PasswordHasher } from './PasswordHasher';
import { FieldError, RegistrationInput, validateRegistration } from './registrationRules';
import { TokenPayload, TokenService } from './TokenService';

/** What the client may see about a user (no e-mail, no password hash). */
export interface PublicUser {
  userId: number;
  username: string;
  points: number;
  lifetimePoints: number;
  tier: number;
}

export type RegisterResult =
  | { success: true; user: PublicUser }
  | { success: false; reason: 'INVALID_INPUT'; errors: FieldError[] }
  | { success: false; reason: 'USERNAME_TAKEN' | 'EMAIL_TAKEN' };

export type LoginResult =
  | { success: true; token: string; user: PublicUser }
  | { success: false; reason: 'INVALID_CREDENTIALS' };

/**
 * Registration, login, and token checks (FR-1, NFR-3).
 *
 * Logging out needs no server work: the server keeps no session, and the
 * client deletes its token (team decision, 21/11/2026). The REST routes and
 * the Socket.io connection check call verifyToken().
 */
export class AuthService {
  private dummyHash?: Promise<string>;

  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly tierPolicy: TierPolicy = new TierPolicy(),
  ) {}

  /** Creates an account (POST /api/auth/register). The password is stored only as a salted hash. */
  async register(input: Partial<Record<keyof RegistrationInput, unknown>>): Promise<RegisterResult> {
    // Spaces around the e-mail address are removed before it is checked and stored.
    const email = typeof input.email === 'string' ? input.email.trim() : input.email;
    const errors = validateRegistration({ ...input, email });
    if (errors.length > 0) {
      return { success: false, reason: 'INVALID_INPUT', errors };
    }
    const username = input.username as string;
    const passwordHash = await this.hasher.hash(input.password as string);

    try {
      const user = await this.users.create({ username, email: email as string, passwordHash });
      return { success: true, user: this.toPublicUser(user) };
    } catch (error) {
      if (error instanceof DuplicateUserError) {
        return { success: false, reason: error.field === 'username' ? 'USERNAME_TAKEN' : 'EMAIL_TAKEN' };
      }
      throw error;
    }
  }

  /**
   * Logs in with a username or an e-mail address (POST /api/auth/login) and
   * returns a token valid for 24 hours. An unknown user and a wrong password
   * give the same answer, so the answer does not reveal which accounts exist.
   */
  async login(usernameOrEmail: unknown, password: unknown): Promise<LoginResult> {
    if (typeof usernameOrEmail !== 'string' || typeof password !== 'string') {
      return { success: false, reason: 'INVALID_CREDENTIALS' };
    }
    const user = await this.users.findByLogin(usernameOrEmail.trim());
    // Check a password also when the user is unknown, so both cases take about the same time.
    const matches = await this.hasher.verify(password, user ? user.passwordHash : await this.getDummyHash());
    if (!user || !matches) {
      return { success: false, reason: 'INVALID_CREDENTIALS' };
    }
    const token = this.tokens.issue({ userId: user.userId, username: user.username });
    return { success: true, token, user: this.toPublicUser(user) };
  }

  /** The user of a valid token, or null (expired, changed, or not a token). */
  verifyToken(token: unknown): TokenPayload | null {
    return typeof token === 'string' && token.length > 0 ? this.tokens.verify(token) : null;
  }

  private toPublicUser(user: UserRecord): PublicUser {
    return {
      userId: user.userId,
      username: user.username,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      tier: this.tierPolicy.getTier(user.lifetimePoints),
    };
  }

  private getDummyHash(): Promise<string> {
    this.dummyHash ??= this.hasher.hash('not-a-real-password');
    return this.dummyHash;
  }
}
