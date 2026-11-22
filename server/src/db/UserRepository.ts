/** A user account without the password hash. */
export interface UserRecord {
  userId: number;
  username: string;
  email: string;
  points: number;
  lifetimePoints: number;
}

/** A user account with the password hash, only for checking a login. */
export interface UserWithPassword extends UserRecord {
  passwordHash: string;
}

/** The data of a new account; the password is already hashed. */
export interface NewUser {
  username: string;
  email: string;
  passwordHash: string;
}

/** Thrown by create() when the username or the e-mail is already used (FR-1). */
export class DuplicateUserError extends Error {
  constructor(readonly field: 'username' | 'email') {
    super(`This ${field === 'username' ? 'username' : 'e-mail'} is already registered`);
    this.name = 'DuplicateUserError';
  }
}

/**
 * Data access for user accounts (FR-1), Repository Pattern.
 * Usernames and e-mails are compared without regard to upper and lower case,
 * like the unique indexes of the users table.
 */
export interface UserRepository {
  /** Saves a new account with 0 points. Throws DuplicateUserError if the username or e-mail is taken. */
  create(user: NewUser): Promise<UserRecord>;

  /** Finds the account by e-mail (if the text contains "@") or by username; null if none. */
  findByLogin(usernameOrEmail: string): Promise<UserWithPassword | null>;

  /** The account with this id, or null. */
  findById(userId: number): Promise<UserRecord | null>;
}
