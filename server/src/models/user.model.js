import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const SALT_ROUNDS = 12;
const MAX_TAG_COUNT = 25;
const MAX_TAG_LENGTH = 50;

function isValidOptionalHttpUrl(value) {
  if (!value) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidTagArray(items) {
  if (!Array.isArray(items) || items.length > MAX_TAG_COUNT) {
    return false;
  }

  return items.every(
    (item) => typeof item === 'string' && item.trim().length > 0 && item.trim().length <= MAX_TAG_LENGTH,
  );
}

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    college: {
      type: String,
      required: [true, 'College is required'],
      trim: true,
      minlength: [2, 'College name must be at least 2 characters'],
      maxlength: [150, 'College name cannot exceed 150 characters'],
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: isValidTagArray,
        message: `Skills must contain at most ${MAX_TAG_COUNT} non-empty entries of up to ${MAX_TAG_LENGTH} characters each`,
      },
    },
    interests: {
      type: [String],
      default: [],
      validate: {
        validator: isValidTagArray,
        message: `Interests must contain at most ${MAX_TAG_COUNT} non-empty entries of up to ${MAX_TAG_LENGTH} characters each`,
      },
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin'],
        message: 'Role must be either student or admin',
      },
      default: 'student',
    },
    profileImage: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Profile image URL cannot exceed 500 characters'],
      validate: {
        validator: isValidOptionalHttpUrl,
        message: 'Profile image must be a valid http or https URL',
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.pre('save', async function hashPasswordBeforeSave() {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
