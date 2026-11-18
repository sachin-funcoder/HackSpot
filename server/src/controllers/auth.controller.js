import { loginUser, registerStudent } from '../services/auth.service.js';
import AppError from '../utils/appError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { clearAuthCookie, setAuthCookie } from '../utils/jwt.js';
import { validateLoginInput, validateRegistrationInput } from '../utils/validators.js';

export async function register(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateRegistrationInput(req.body);

    if (!isValid) {
      throw new AppError(400, 'Please fix the validation errors and try again.', errors);
    }

    const { user, token } = await registerStudent(sanitized);

    setAuthCookie(res, token);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Student account registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateLoginInput(req.body);

    if (!isValid) {
      throw new AppError(400, 'Please enter a valid email and password.', errors);
    }

    const { user, token } = await loginUser(sanitized);

    setAuthCookie(res, token);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Logged in successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export function getCurrentUser(req, res) {
  return sendSuccess(res, {
    statusCode: 200,
    message: 'Authenticated user profile fetched successfully',
    data: {
      user: req.user,
    },
  });
}

export function logout(req, res) {
  clearAuthCookie(res);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Logged out successfully',
  });
}
