import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import AppError from './appError.js';

const DEFAULT_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function parseDurationToMs(duration) {
  if (typeof duration === 'number' && Number.isFinite(duration)) {
    return duration * 1000;
  }

  if (typeof duration !== 'string') {
    return DEFAULT_COOKIE_MAX_AGE_MS;
  }

  const match = duration.trim().match(/^(\d+)([smhd])$/i);
  if (!match) {
    return DEFAULT_COOKIE_MAX_AGE_MS;
  }

  const value = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
}

function requireJwtSecret() {
  if (!env.jwtSecret) {
    throw new AppError(500, 'Authentication is not configured. Missing JWT_SECRET.');
  }
  return env.jwtSecret;
}

export function signAuthToken(user) {
  const secret = requireJwtSecret();

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    secret,
    {
      expiresIn: env.jwtExpiresIn,
    },
  );
}

export function verifyAuthToken(token) {
  const secret = requireJwtSecret();
  return jwt.verify(token, secret);
}

export function getAuthCookieOptions() {
  const isProduction = env.nodeEnv === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: parseDurationToMs(env.jwtExpiresIn),
    path: '/',
  };
}

export function setAuthCookie(res, token) {
  res.cookie(env.authCookieName, token, getAuthCookieOptions());
}

export function clearAuthCookie(res) {
  const { httpOnly, secure, sameSite, path } = getAuthCookieOptions();
  res.clearCookie(env.authCookieName, {
    httpOnly,
    secure,
    sameSite,
    path,
  });
}
