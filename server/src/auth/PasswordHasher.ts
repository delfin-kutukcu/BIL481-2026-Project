import { compare, hash } from 'bcryptjs';

/** Turns passwords into salted hashes and checks them (NFR-3). */
export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, passwordHash: string): Promise<boolean>;
}

/**
 * bcrypt with a new random salt for every password (QA Plan TC-01).
 * bcryptjs is a pure JavaScript implementation of bcrypt: it needs no native
 * build, and its hashes have the standard $2a$/$2b$ format.
 * 10 rounds is the usual minimum; tests use fewer rounds to run faster.
 */
export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly rounds: number = 10) {}

  hash(password: string): Promise<string> {
    return hash(password, this.rounds);
  }

  verify(password: string, passwordHash: string): Promise<boolean> {
    return compare(password, passwordHash);
  }
}
