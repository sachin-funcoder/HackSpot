import mongoose from 'mongoose';

const MAX_SKILLS_COUNT = 25;
const MAX_CATEGORIES_COUNT = 10;
const MAX_TAG_LENGTH = 50;

export const HACKATHON_MODES = ['online', 'offline', 'hybrid'];
export const HACKATHON_STATUSES = ['upcoming', 'ongoing', 'completed'];

export function computeHackathonStatus(startDate, endDate, referenceDate = new Date()) {
  const now = referenceDate.getTime();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (now < start) {
    return 'upcoming';
  }

  if (now <= end) {
    return 'ongoing';
  }

  return 'completed';
}

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidOptionalHttpUrl(value) {
  if (!value) {
    return true;
  }
  return isValidHttpUrl(value);
}

function isValidTagList(maxCount, allowEmpty = true) {
  return (items) => {
    if (!Array.isArray(items) || items.length > maxCount) {
      return false;
    }

    if (!allowEmpty && items.length === 0) {
      return false;
    }

    return items.every(
      (item) => typeof item === 'string' && item.trim().length > 0 && item.trim().length <= MAX_TAG_LENGTH,
    );
  };
}

const hackathonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Hackathon title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Hackathon slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      minlength: [10, 'Short description must be at least 10 characters'],
      maxlength: [260, 'Short description cannot exceed 260 characters'],
    },
    description: {
      type: String,
      required: [true, 'Full description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    organizerName: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true,
      minlength: [2, 'Organizer name must be at least 2 characters'],
      maxlength: [120, 'Organizer name cannot exceed 120 characters'],
    },
    organizerLogo: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Organizer logo URL cannot exceed 500 characters'],
      validate: {
        validator: isValidOptionalHttpUrl,
        message: 'Organizer logo must be a valid http:// or https:// URL',
      },
    },
    bannerImage: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Banner image URL cannot exceed 500 characters'],
      validate: {
        validator: isValidOptionalHttpUrl,
        message: 'Banner image must be a valid http:// or https:// URL',
      },
    },
    mode: {
      type: String,
      required: [true, 'Hackathon mode is required'],
      enum: {
        values: HACKATHON_MODES,
        message: 'Mode must be online, offline, or hybrid',
      },
      lowercase: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      minlength: [2, 'Location must be at least 2 characters'],
      maxlength: [160, 'Location cannot exceed 160 characters'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    registrationDeadline: {
      type: Date,
      required: [true, 'Registration deadline is required'],
    },
    registrationLink: {
      type: String,
      required: [true, 'Registration link is required'],
      trim: true,
      maxlength: [500, 'Registration link cannot exceed 500 characters'],
      validate: {
        validator: isValidHttpUrl,
        message: 'Registration link must be a valid http:// or https:// URL',
      },
    },
    eligibility: {
      type: String,
      required: [true, 'Eligibility criteria is required'],
      trim: true,
      minlength: [3, 'Eligibility must be at least 3 characters'],
      maxlength: [300, 'Eligibility cannot exceed 300 characters'],
      default: 'Open to undergraduate and graduate students',
    },
    prizePool: {
      type: String,
      required: [true, 'Prize pool information is required'],
      trim: true,
      minlength: [1, 'Prize pool is required'],
      maxlength: [120, 'Prize pool cannot exceed 120 characters'],
    },
    teamSizeMin: {
      type: Number,
      required: [true, 'Minimum team size is required'],
      min: [1, 'Minimum team size must be at least 1'],
      max: [10, 'Minimum team size cannot exceed 10'],
      default: 1,
    },
    teamSizeMax: {
      type: Number,
      required: [true, 'Maximum team size is required'],
      min: [1, 'Maximum team size must be at least 1'],
      max: [10, 'Maximum team size cannot exceed 10'],
      default: 4,
    },
    requiredSkills: {
      type: [String],
      default: [],
      validate: {
        validator: isValidTagList(MAX_SKILLS_COUNT, true),
        message: `Required skills must contain at most ${MAX_SKILLS_COUNT} non-empty entries of up to ${MAX_TAG_LENGTH} characters`,
      },
    },
    categories: {
      type: [String],
      required: [true, 'At least one category is required'],
      validate: {
        validator: isValidTagList(MAX_CATEGORIES_COUNT, false),
        message: `Categories must contain 1 to ${MAX_CATEGORIES_COUNT} non-empty entries of up to ${MAX_TAG_LENGTH} characters`,
      },
    },
    status: {
      type: String,
      enum: {
        values: HACKATHON_STATUSES,
        message: 'Status must be upcoming, ongoing, or completed',
      },
      default: 'upcoming',
    },
    isDemo: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

hackathonSchema.index({ startDate: 1, endDate: 1 });
hackathonSchema.index({ registrationDeadline: 1 });
hackathonSchema.index({ mode: 1, startDate: 1 });
hackathonSchema.index({ categories: 1 });
hackathonSchema.index({ requiredSkills: 1 });

hackathonSchema.pre('validate', function validateDatesAndComputeStatus() {
  if (this.startDate && this.endDate) {
    if (this.endDate <= this.startDate) {
      this.invalidate('endDate', 'End date must be after start date.');
    }

    if (this.registrationDeadline && this.registrationDeadline > this.endDate) {
      this.invalidate(
        'registrationDeadline',
        'Registration deadline cannot be after the hackathon end date.',
      );
    }

    this.status = computeHackathonStatus(this.startDate, this.endDate);
  }

  if (
    typeof this.teamSizeMin === 'number' &&
    typeof this.teamSizeMax === 'number' &&
    this.teamSizeMax < this.teamSizeMin
  ) {
    this.invalidate('teamSizeMax', 'Maximum team size must be greater than or equal to minimum team size.');
  }
});

const Hackathon = mongoose.model('Hackathon', hackathonSchema);

export default Hackathon;
