import { BcryptPasswordHasher } from '../../src/auth/PasswordHasher';

// Uses the real bcryptjs package; 4 rounds keep the test fast.
const hasher = new BcryptPasswordHasher(4);

describe('BcryptPasswordHasher (NFR-3, QA Plan TC-01: salted bcrypt hash)', () => {
  test('the hash is a bcrypt hash and does not contain the password', async () => {
    const passwordHash = await hasher.hash('correct-horse');

    expect(passwordHash).toMatch(/^\$2[aby]\$04\$/);
    expect(passwordHash).not.toContain('correct-horse');
  });

  test('every hash has its own salt: the same password gives two different hashes', async () => {
    const first = await hasher.hash('correct-horse');
    const second = await hasher.hash('correct-horse');

    expect(first).not.toBe(second);
    expect(await hasher.verify('correct-horse', first)).toBe(true);
    expect(await hasher.verify('correct-horse', second)).toBe(true);
  });

  test('a wrong password does not match', async () => {
    const passwordHash = await hasher.hash('correct-horse');

    expect(await hasher.verify('Correct-horse', passwordHash)).toBe(false);
  });
});
