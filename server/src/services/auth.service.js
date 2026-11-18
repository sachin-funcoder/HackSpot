import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import { signAuthToken } from '../utils/jwt.js';

export function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    college: user.college,
    skills: user.skills || [],
    interests: user.interests || [],
    role: user.role,
    profileImage: user.profileImage || '',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function registerStudent({ name, email, password, college, skills, interests }) {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError(409, 'An account with this email already exists.', {
      email: 'This email address is already registered.',
    });
  }

  // Always force role to 'student' on public registration to prevent privilege escalation
  const user = await User.create({
    name,
    email,
    password,
    college,
    skills: skills || [],
    interests: interests || [],
    role: 'student',
  });

  const token = signAuthToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password.');
  }

  const token = signAuthToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
}

export async function getUserProfileById(userId) {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(401, 'Authenticated user account no longer exists.');
  }

  return sanitizeUser(user);
}
