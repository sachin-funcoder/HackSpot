import env from '../config/env.js';
import { getUserProfileById } from '../services/auth.service.js';
import AppError from '../utils/appError.js';
import { verifyAuthToken } from '../utils/jwt.js';

function extractAuthToken(req) {
  if (req.cookies && req.cookies[env.authCookieName]) {
    return req.cookies[env.authCookieName];
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return null;
}

export async function authenticate(req, res, next) {
  try {
    const token = extractAuthToken(req);

    if (!token) {
      throw new AppError(401, 'Authentication required. Please log in.');
    }

    let decoded;
    try {
      decoded = verifyAuthToken(token);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError(401, 'Your session has expired. Please log in again.');
      }
      throw new AppError(401, 'Invalid authentication token. Please log in again.');
    }

    const user = await getUserProfileById(decoded.sub);
    req.user = user;

    return next();
  } catch (error) {
    return next(error);
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required. Please log in.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to access this resource.'));
    }

    return next();
  };
}
