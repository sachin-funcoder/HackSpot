import env from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

export function notFoundHandler(req, res) {
  return sendError(res, {
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function normalizeError(err) {
  // Operational AppError
  if (err.isOperational) {
    return {
      statusCode: err.statusCode || 500,
      message: err.message || 'Request failed',
      errors: err.errors || null,
    };
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError' && err.errors) {
    const fieldErrors = {};
    for (const [field, details] of Object.entries(err.errors)) {
      fieldErrors[field] = details.message;
    }

    return {
      statusCode: 400,
      message: 'Validation failed. Please check your input.',
      errors: fieldErrors,
    };
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const duplicatedField = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field';
    return {
      statusCode: 409,
      message: `A record with this ${duplicatedField} already exists.`,
      errors: { [duplicatedField]: `This ${duplicatedField} is already in use.` },
    };
  }

  // Mongoose invalid ObjectId CastError
  if (err.name === 'CastError') {
    return {
      statusCode: 400,
      message: `Invalid ${err.path}: ${err.value}`,
      errors: null,
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return {
      statusCode: 401,
      message: 'Invalid authentication token.',
      errors: null,
    };
  }

  if (err.name === 'TokenExpiredError') {
    return {
      statusCode: 401,
      message: 'Authentication token has expired.',
      errors: null,
    };
  }

  return {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    errors: null,
  };
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const normalized = normalizeError(err);

  if (env.nodeEnv !== 'test') {
    console.error(`[Error] ${normalized.statusCode} - ${normalized.message}`);
  }

  const responseErrors =
    normalized.errors ||
    (env.nodeEnv === 'development' && normalized.statusCode >= 500 && err.stack
      ? { stack: err.stack }
      : null);

  return sendError(res, {
    statusCode: normalized.statusCode,
    message: normalized.message,
    errors: responseErrors,
  });
}
