import { verifyToken } from '@clerk/backend';

function getBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;

  const [scheme, token] = authHeader.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export async function requireClerkAuth(req, res, next) {
  try {
    const allowTestBypass = process.env.NODE_ENV === 'test' && process.env.OPTIMALL_TEST_BYPASS_AUTH === '1';
    if (allowTestBypass) {
      req.auth = {
        userId: req.headers['x-test-user-id'] || 'test-user',
        sessionId: 'test-session',
        claims: {
          email: req.headers['x-test-email'] || 'test@example.com',
          name: req.headers['x-test-name'] || 'Test User',
        },
      };
      return next();
    }

    const secretKey = process.env.CLERK_SECRET_KEY;
    if (!secretKey) {
      return res.status(500).json({ error: 'Missing CLERK_SECRET_KEY' });
    }

    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: missing bearer token' });
    }

    const verified = await verifyToken(token, { secretKey });
    req.auth = {
      userId: verified.sub,
      sessionId: verified.sid,
      claims: verified,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
}
