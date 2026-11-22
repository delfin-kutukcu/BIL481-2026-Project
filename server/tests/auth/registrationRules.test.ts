import { validateRegistration } from '../../src/auth/registrationRules';

const valid = { username: 'student_1', email: 'student@etu.edu.tr', password: 'longenough' };
const fieldsWithErrors = (input: Record<string, unknown>) => validateRegistration(input).map((error) => error.field);

describe('Registration rules (FR-1, NFR-3: input validation)', () => {
  test('a valid username, e-mail, and password give no errors', () => {
    expect(validateRegistration(valid)).toEqual([]);
  });

  test('usernames of 3 and 30 characters are accepted; 2 and 31 characters are rejected', () => {
    expect(fieldsWithErrors({ ...valid, username: 'abc' })).toEqual([]);
    expect(fieldsWithErrors({ ...valid, username: 'a'.repeat(30) })).toEqual([]);
    expect(fieldsWithErrors({ ...valid, username: 'ab' })).toEqual(['username']);
    expect(fieldsWithErrors({ ...valid, username: 'a'.repeat(31) })).toEqual(['username']);
  });

  test('a username may contain only letters, digits, and _', () => {
    for (const username of ['ali veli', 'ali@etu', 'ali-veli', "x'; DROP TABLE users;--", 'çınar']) {
      expect(fieldsWithErrors({ ...valid, username })).toEqual(['username']);
    }
  });

  test('an e-mail address without the form name@domain.tld is rejected', () => {
    for (const email of ['student', 'student@etu', 'student etu@etu.edu.tr', '@etu.edu.tr']) {
      expect(fieldsWithErrors({ ...valid, email })).toEqual(['email']);
    }
  });

  test('passwords need at least 8 characters', () => {
    expect(fieldsWithErrors({ ...valid, password: '12345678' })).toEqual([]);
    expect(fieldsWithErrors({ ...valid, password: '1234567' })).toEqual(['password']);
  });

  test('passwords longer than 72 bytes are rejected, because bcrypt would ignore the rest', () => {
    expect(fieldsWithErrors({ ...valid, password: 'a'.repeat(72) })).toEqual([]);
    expect(fieldsWithErrors({ ...valid, password: 'ş'.repeat(37) })).toEqual(['password']); // 74 bytes
  });

  test('missing or non-text values are rejected field by field', () => {
    expect(fieldsWithErrors({})).toEqual(['username', 'email', 'password']);
    expect(fieldsWithErrors({ username: 42, email: null, password: ['a'] })).toEqual(['username', 'email', 'password']);
  });
});
