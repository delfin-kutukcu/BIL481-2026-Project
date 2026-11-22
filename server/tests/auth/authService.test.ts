import { AuthService } from '../../src/auth/AuthService';
import { FakeHasher, FakeTokens, FakeUserRepository } from './fakes';

// Unit tests of registration and login with in-memory test doubles.
// The real bcrypt, JWT, and PostgreSQL parts are tested in passwordHasher.test.ts,
// tokenService.test.ts, and tests/db/userRepository*.test.ts.

function setUp() {
  const users = new FakeUserRepository();
  const hasher = new FakeHasher();
  return { users, hasher, auth: new AuthService(users, hasher, new FakeTokens()) };
}

const student = { username: 'student_1', email: 'student@etu.edu.tr', password: 'correct-horse' };

describe('AuthService.register (FR-1, QA Plan TC-01)', () => {
  test('a valid registration creates the account with 0 points in Tier 1', async () => {
    const { auth } = setUp();

    expect(await auth.register(student)).toEqual({
      success: true,
      user: { userId: 1, username: 'student_1', points: 0, lifetimePoints: 0, tier: 1 },
    });
  });

  test('NFR-3: the password is stored only as a hash, never as plain text', async () => {
    const { auth, users, hasher } = setUp();
    await auth.register(student);

    expect(users.rows[0].passwordHash).not.toContain('correct-horse');
    expect(await hasher.verify('correct-horse', users.rows[0].passwordHash)).toBe(true);
  });

  test('a username that is already registered is rejected, also in other letter case', async () => {
    const { auth } = setUp();
    await auth.register(student);

    expect(await auth.register({ ...student, username: 'STUDENT_1', email: 'other@etu.edu.tr' }))
      .toEqual({ success: false, reason: 'USERNAME_TAKEN' });
  });

  test('an e-mail that is already registered is rejected, also in other letter case', async () => {
    const { auth } = setUp();
    await auth.register(student);

    expect(await auth.register({ ...student, username: 'student_2', email: 'Student@ETU.edu.tr' }))
      .toEqual({ success: false, reason: 'EMAIL_TAKEN' });
  });

  test('invalid input is rejected with the field errors, and nothing is hashed or stored', async () => {
    const { auth, users, hasher } = setUp();
    const result = await auth.register({ username: 'ab', email: 'student', password: 'short' });

    expect(result.success).toBe(false);
    expect(!result.success && result.reason === 'INVALID_INPUT' && result.errors.map((e) => e.field))
      .toEqual(['username', 'email', 'password']);
    expect(hasher.hashCalls).toBe(0);
    expect(users.rows).toHaveLength(0);
  });

  test('spaces around the e-mail address are removed before it is stored', async () => {
    const { auth, users } = setUp();
    await auth.register({ ...student, email: 'student@etu.edu.tr ' });

    expect(users.rows[0].email).toBe('student@etu.edu.tr');
  });
});

describe('AuthService.login (FR-1, QA Plan TC-01)', () => {
  test('login with the username returns a token and the user', async () => {
    const { auth } = setUp();
    await auth.register(student);

    expect(await auth.login('student_1', 'correct-horse')).toEqual({
      success: true,
      token: 'token:1:student_1',
      user: { userId: 1, username: 'student_1', points: 0, lifetimePoints: 0, tier: 1 },
    });
  });

  test('login with the e-mail address works too, in any letter case', async () => {
    const { auth } = setUp();
    await auth.register(student);

    expect((await auth.login('STUDENT@etu.edu.tr', 'correct-horse')).success).toBe(true);
  });

  test('a wrong password fails', async () => {
    const { auth } = setUp();
    await auth.register(student);

    expect(await auth.login('student_1', 'wrong-password')).toEqual({ success: false, reason: 'INVALID_CREDENTIALS' });
  });

  test('an unknown user gets the same answer as a wrong password, and a password is still checked', async () => {
    const { auth, hasher } = setUp();

    expect(await auth.login('nobody', 'correct-horse')).toEqual({ success: false, reason: 'INVALID_CREDENTIALS' });
    expect(hasher.verifyCalls).toBe(1);
  });

  test('missing values fail without an error', async () => {
    const { auth } = setUp();

    expect(await auth.login(undefined, 'x')).toEqual({ success: false, reason: 'INVALID_CREDENTIALS' });
    expect(await auth.login('student_1', 12345678)).toEqual({ success: false, reason: 'INVALID_CREDENTIALS' });
  });

  test('the login answer has the current points and tier for the top bar', async () => {
    const { auth, users } = setUp();
    await auth.register(student);
    Object.assign(users.rows[0], { points: 25, lifetimePoints: 225 });

    const result = await auth.login('student_1', 'correct-horse');
    expect(result.success && result.user).toEqual({ userId: 1, username: 'student_1', points: 25, lifetimePoints: 225, tier: 2 });
  });
});

describe('AuthService.verifyToken (NFR-3: authenticated requests and WebSocket connections)', () => {
  test('the token of a login gives back the user', async () => {
    const { auth } = setUp();
    await auth.register(student);
    const result = await auth.login('student_1', 'correct-horse');

    expect(result.success && auth.verifyToken(result.token)).toEqual({ userId: 1, username: 'student_1' });
  });

  test('a missing or invalid token gives null', () => {
    const { auth } = setUp();

    for (const token of [undefined, null, '', 'not-a-token', 42]) {
      expect(auth.verifyToken(token)).toBeNull();
    }
  });
});
