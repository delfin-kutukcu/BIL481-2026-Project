import { JwtTokenService, TOKEN_LIFETIME_SECONDS } from '../../src/auth/TokenService';

// Uses the real jsonwebtoken package.
const SECRET = 'test-secret-that-is-long-enough-0123456789';
const tokens = new JwtTokenService(SECRET);

const base64url = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
const payloadOf = (token: string) => JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());

describe('JwtTokenService (FR-1, QA Plan TC-01: signed JWT)', () => {
  test('a token gives back the user it was issued for', () => {
    expect(tokens.verify(tokens.issue({ userId: 7, username: 'student_1' }))).toEqual({ userId: 7, username: 'student_1' });
  });

  test('a token is valid for 24 hours', () => {
    const payload = payloadOf(tokens.issue({ userId: 7, username: 'student_1' }));

    expect(TOKEN_LIFETIME_SECONDS).toBe(86400);
    expect(payload.exp - payload.iat).toBe(86400);
  });

  test('an expired token is rejected', () => {
    const expired = new JwtTokenService(SECRET, -10).issue({ userId: 7, username: 'student_1' });

    expect(tokens.verify(expired)).toBeNull();
  });

  test('a token signed with another secret is rejected', () => {
    const other = new JwtTokenService('another-secret-that-is-long-enough-987654').issue({ userId: 7, username: 'student_1' });

    expect(tokens.verify(other)).toBeNull();
  });

  test('a token whose payload was changed is rejected', () => {
    const [header, , signature] = tokens.issue({ userId: 7, username: 'student_1' }).split('.');
    const changed = `${header}.${base64url({ sub: '1', username: 'admin' })}.${signature}`;

    expect(tokens.verify(changed)).toBeNull();
  });

  test('an unsigned token ("alg": "none") is rejected', () => {
    const unsigned = `${base64url({ alg: 'none', typ: 'JWT' })}.${base64url({ sub: '7', username: 'student_1' })}.`;

    expect(tokens.verify(unsigned)).toBeNull();
  });

  test('text that is not a token is rejected', () => {
    expect(tokens.verify('not-a-token')).toBeNull();
  });

  test('a short secret or the example value of .env.example is refused', () => {
    expect(() => new JwtTokenService('too-short')).toThrow('at least 32 characters');
    expect(() => new JwtTokenService('change-me-to-a-long-random-string-of-at-least-32-characters')).toThrow('example value');
  });
});
