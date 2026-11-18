import {
  getMyProfile,
  getPublicUserProfile,
  updateMyProfile,
} from '../services/user.service.js';
import AppError from '../utils/appError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { validateProfileUpdateInput } from '../utils/validators.js';

export async function getMe(req, res, next) {
  try {
    const user = await getMyProfile(req.user.id);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Student profile fetched successfully',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateMe(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateProfileUpdateInput(req.body);

    if (!isValid) {
      throw new AppError(400, 'Please fix the profile validation errors and try again.', errors);
    }

    const user = await updateMyProfile(req.user.id, sanitized);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getPublicProfile(req, res, next) {
  try {
    const user = await getPublicUserProfile(req.params.id);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Public student profile fetched successfully',
      data: { user },
    });
  } catch (error) {
    return next(error);
  }
}
