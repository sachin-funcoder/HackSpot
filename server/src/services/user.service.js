import mongoose from 'mongoose';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import { sanitizeUser } from './auth.service.js';

const ALLOWED_UPDATE_FIELDS = ['name', 'college', 'skills', 'interests', 'profileImage'];

export function sanitizePublicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    college: user.college,
    skills: user.skills || [],
    interests: user.interests || [],
    profileImage: user.profileImage || '',
    createdAt: user.createdAt,
  };
}

export async function getMyProfile(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(404, 'User profile not found.');
  }

  return sanitizeUser(user);
}

export async function updateMyProfile(userId, updates) {
  const safeUpdatePayload = {};

  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (Object.hasOwn(updates, field)) {
      safeUpdatePayload[field] = updates[field];
    }
  }

  if (Object.keys(safeUpdatePayload).length === 0) {
    throw new AppError(400, 'No valid profile fields provided to update.');
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: safeUpdatePayload },
    {
      returnDocument: 'after',
      runValidators: true,
      context: 'query',
    },
  );

  if (!updatedUser) {
    throw new AppError(404, 'User profile not found.');
  }

  return sanitizeUser(updatedUser);
}

export async function getPublicUserProfile(userId) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(400, 'Invalid user ID format.');
  }

  const user = await User.findById(userId).select(
    'name college skills interests profileImage createdAt',
  );

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  return sanitizePublicUser(user);
}
