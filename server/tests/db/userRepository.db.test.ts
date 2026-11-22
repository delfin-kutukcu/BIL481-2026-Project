import { Pool } from 'pg';
import { AuthService } from '../../src/auth/AuthService';
import { BcryptPasswordHasher } from '../../src/auth/PasswordHasher';
import { JwtTokenService } from '../../src/auth/TokenService';
import { PgUserRepository } from '../../src/db/PgUserRepository';

// QA Plan TC-01 against a real PostgreSQL database, with the real bcrypt and JWT code.
// It runs only when TEST_DATABASE_URL is set; otherwise it is skipped.
//
//   1. Create the tables once:  npm run db:init
//   2. bash:        TEST_DATABASE_URL=postgres://user:password@localhost:5432/studyloft npm test
//      PowerShell:  $env:TEST_DATABASE_URL="postgres://user:password@localhost:5432/studyloft"; npm test
//
// The test creates its own users (names start with task11_) and deletes them at the end.

const url = process.env.TEST_DATABASE_URL;
const describeWithDatabase = url ? describe : describe.skip;

describeWithDatabase('AuthService with PgUserRepository and PostgreSQL: QA Plan TC-01 (TEST_DATABASE_URL)', () => {
  let pool: Pool;
  let auth: AuthService;
  const tokens = new JwtTokenService('integration-test-secret-0123456789abcdef');

  beforeAll(async () => {
    pool = new Pool({ connectionString: url });
    auth = new AuthService(new PgUserRepository(pool), new BcryptPasswordHasher(4), tokens);
    await pool.query("DELETE FROM users WHERE username LIKE 'task11\\_%'");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM users WHERE username LIKE 'task11\\_%'");
    await pool.end();
  });

  const unique = () => `${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  test('register, reject duplicates, and log in (TC-01 steps 1 to 4)', async () => {
    const id = unique();
    const student = { username: `task11_${id}`, email: `task11_${id}@etu.edu.tr`, password: 'correct-horse' };

    // Step 1: registration
    const registered = await auth.register(student);
    expect(registered.success).toBe(true);
    const userId = registered.success ? registered.user.userId : 0;

    // Step 2: the same username, then the same e-mail (other letter case)
    expect(await auth.register({ ...student, username: student.username.toUpperCase(), email: `other_${id}@etu.edu.tr` }))
      .toEqual({ success: false, reason: 'USERNAME_TAKEN' });
    expect(await auth.register({ ...student, username: `task11_b${id}`.slice(0, 30), email: student.email.toUpperCase() }))
      .toEqual({ success: false, reason: 'EMAIL_TAKEN' });

    // Step 3: the users table holds a salted bcrypt hash, never the password
    const stored = await pool.query('SELECT password_hash, points, lifetime_points FROM users WHERE user_id = $1', [userId]);
    expect(stored.rows[0].password_hash).toMatch(/^\$2[aby]\$/);
    expect(stored.rows[0].password_hash).not.toContain('correct-horse');
    expect([Number(stored.rows[0].points), Number(stored.rows[0].lifetime_points)]).toEqual([0, 0]);

    // Step 4: wrong password, then the valid password (username, then e-mail)
    expect(await auth.login(student.username, 'wrong-password')).toEqual({ success: false, reason: 'INVALID_CREDENTIALS' });
    const byName = await auth.login(student.username, 'correct-horse');
    const byEmail = await auth.login(student.email.toUpperCase(), 'correct-horse');
    expect(byName.success && auth.verifyToken(byName.token)).toEqual({ userId, username: student.username });
    expect(byEmail.success && byEmail.user.userId).toBe(userId);
  });

  test('two registrations with the same username at the same time: exactly one succeeds', async () => {
    const id = unique();
    const results = await Promise.all([
      auth.register({ username: `task11_${id}`, email: `a_${id}@etu.edu.tr`, password: 'correct-horse' }),
      auth.register({ username: `task11_${id}`, email: `b_${id}@etu.edu.tr`, password: 'correct-horse' }),
    ]);

    expect(results.map((result) => (result.success ? 'CREATED' : result.reason)).sort()).toEqual(['CREATED', 'USERNAME_TAKEN']);
  });

  test('an unknown user cannot log in', async () => {
    expect(await auth.login(`task11_nobody_${unique()}`.slice(0, 30), 'correct-horse'))
      .toEqual({ success: false, reason: 'INVALID_CREDENTIALS' });
  });
});
