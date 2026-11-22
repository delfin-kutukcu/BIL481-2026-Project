/**
 * Input rules of registration (FR-1, NFR-3: input must be validated).
 * Decided by the team on 21/11/2026; the database limits are in src/db/schema.sql.
 */

/** 3 to 30 letters, digits, or underscores. A username can therefore never contain "@". */
export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,30}$/;

export const PASSWORD_MIN_LENGTH = 8;

/** bcrypt uses only the first 72 bytes of a password, so longer passwords are rejected. */
export const PASSWORD_MAX_BYTES = 72;

/** Simple format check: something@something.something, without spaces. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 255; // users.email is VARCHAR(255)

export interface RegistrationInput {
  username: string;
  email: string;
  password: string;
}

export interface FieldError {
  field: 'username' | 'email' | 'password';
  message: string;
}

/**
 * Checks the registration input and returns one error per invalid field
 * (an empty list means the input is valid). The values come from a JSON
 * request, so their types are checked too.
 */
export function validateRegistration(input: Partial<Record<keyof RegistrationInput, unknown>>): FieldError[] {
  const errors: FieldError[] = [];
  const { username, email, password } = input;

  if (typeof username !== 'string' || !USERNAME_PATTERN.test(username)) {
    errors.push({ field: 'username', message: 'Username must be 3 to 30 characters: letters, digits, or _' });
  }
  if (typeof email !== 'string' || email.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(email)) {
    errors.push({ field: 'email', message: 'E-mail address is not valid' });
  }
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    errors.push({ field: 'password', message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters` });
  } else if (Buffer.byteLength(password, 'utf8') > PASSWORD_MAX_BYTES) {
    errors.push({ field: 'password', message: `Password must be at most ${PASSWORD_MAX_BYTES} bytes` });
  }
  return errors;
}
