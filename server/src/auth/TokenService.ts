import { sign as signJwt, verify as verifyJwt } from 'jsonwebtoken';

/** What a login token says about its user. */
export interface TokenPayload {
  userId: number;
  username: string;
}

/** Issues and checks login tokens (FR-1, QA Plan TC-01: "a signed session/JWT token"). */
export interface TokenService {
  issue(payload: TokenPayload): string;
  /** The payload of a valid token; null if the token is malformed, has a wrong signature, or has expired. */
  verify(token: string): TokenPayload | null;
}

/** Tokens are valid for 24 hours (team decision, 21/11/2026). */
export const TOKEN_LIFETIME_SECONDS = 24 * 60 * 60;

/**
 * JSON Web Tokens signed with HMAC-SHA256 and the server's secret (JWT_SECRET).
 * The server keeps no session: logging out means that the client deletes its
 * token, which is otherwise valid until it expires (team decision, 21/11/2026).
 */
export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly lifetimeSeconds: number = TOKEN_LIFETIME_SECONDS,
  ) {
    if (typeof secret !== 'string' || secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    if (secret.startsWith('change-me')) {
      throw new Error('JWT_SECRET still has the example value of .env.example; set your own random value');
    }
  }

  issue(payload: TokenPayload): string {
    return signJwt({ username: payload.username }, this.secret, {
      algorithm: 'HS256',
      subject: String(payload.userId),
      expiresIn: this.lifetimeSeconds,
    });
  }

  verify(token: string): TokenPayload | null {
    try {
      // Only HS256 is accepted, so a token with "alg": "none" or another algorithm is rejected.
      const decoded = verifyJwt(token, this.secret, { algorithms: ['HS256'] });
      if (typeof decoded === 'string' || typeof decoded.sub !== 'string' || typeof decoded.username !== 'string') {
        return null;
      }
      const userId = Number(decoded.sub);
      return Number.isInteger(userId) && userId > 0 ? { userId, username: decoded.username } : null;
    } catch {
      return null;
    }
  }
}
