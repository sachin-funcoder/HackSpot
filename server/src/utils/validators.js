const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MAX_TAG_COUNT = 25;
const MAX_TAG_LENGTH = 50;
const MAX_PROFILE_IMAGE_URL_LENGTH = 500;

const ALLOWED_PROFILE_UPDATE_FIELDS = new Set([
  'name',
  'college',
  'skills',
  'interests',
  'profileImage',
]);

const PROTECTED_PROFILE_FIELDS = new Set([
  'email',
  'password',
  'role',
  '_id',
  'id',
  'createdAt',
  'updatedAt',
]);

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set();
  const result = [];

  for (const item of value) {
    if (typeof item !== 'string') {
      continue;
    }

    const trimmed = item.trim();
    if (!trimmed) {
      continue;
    }

    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(trimmed);
    }
  }

  return result;
}

function validateStrictTagArray(value, fieldLabel) {
  if (!Array.isArray(value)) {
    return {
      error: `${fieldLabel} must be an array of text entries.`,
      sanitized: null,
    };
  }

  if (value.length > MAX_TAG_COUNT) {
    return {
      error: `You can add at most ${MAX_TAG_COUNT} ${fieldLabel.toLowerCase()}.`,
      sanitized: null,
    };
  }

  const seen = new Set();
  const sanitized = [];

  for (const item of value) {
    if (typeof item !== 'string') {
      return {
        error: `Every entry in ${fieldLabel.toLowerCase()} must be text.`,
        sanitized: null,
      };
    }

    const trimmed = item.trim();
    if (!trimmed) {
      return {
        error: `${fieldLabel} cannot contain empty entries.`,
        sanitized: null,
      };
    }

    if (trimmed.length > MAX_TAG_LENGTH) {
      return {
        error: `Each entry in ${fieldLabel.toLowerCase()} must be ${MAX_TAG_LENGTH} characters or fewer.`,
        sanitized: null,
      };
    }

    const normalizedKey = trimmed.toLowerCase();
    if (!seen.has(normalizedKey)) {
      seen.add(normalizedKey);
      sanitized.push(trimmed);
    }
  }

  return {
    error: null,
    sanitized,
  };
}

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateRegistrationInput(body = {}) {
  const errors = {};

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const college = typeof body.college === 'string' ? body.college.trim() : '';

  if (!name) {
    errors.name = 'Full name is required.';
  } else if (name.length < 2 || name.length > 100) {
    errors.name = 'Name must be between 2 and 100 characters.';
  }

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  } else if (password.length > MAX_PASSWORD_LENGTH) {
    errors.password = `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.`;
  }

  if (!college) {
    errors.college = 'College or university name is required.';
  } else if (college.length < 2 || college.length > 150) {
    errors.college = 'College name must be between 2 and 150 characters.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      name,
      email,
      password,
      college,
      skills: normalizeStringArray(body.skills),
      interests: normalizeStringArray(body.interests),
    },
  };
}

export function validateLoginInput(body = {}) {
  const errors = {};

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      email,
      password,
    },
  };
}

export function validateProfileUpdateInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      errors: { body: 'Request payload must be a valid JSON object.' },
      sanitized: {},
    };
  }

  const errors = {};
  const sanitized = {};
  const providedKeys = Object.keys(body);

  const disallowedKeys = providedKeys.filter((key) => !ALLOWED_PROFILE_UPDATE_FIELDS.has(key));
  if (disallowedKeys.length > 0) {
    for (const key of disallowedKeys) {
      if (PROTECTED_PROFILE_FIELDS.has(key)) {
        errors[key] = `The "${key}" field cannot be updated through this endpoint.`;
      } else {
        errors[key] = `Unknown field "${key}" is not allowed.`;
      }
    }
  }

  const updatableKeys = providedKeys.filter((key) => ALLOWED_PROFILE_UPDATE_FIELDS.has(key));
  if (updatableKeys.length === 0 && Object.keys(errors).length === 0) {
    errors.general = 'Provide at least one profile field to update.';
  }

  if (Object.hasOwn(body, 'name')) {
    if (typeof body.name !== 'string') {
      errors.name = 'Name must be text.';
    } else {
      const trimmedName = body.name.trim();
      if (!trimmedName) {
        errors.name = 'Full name is required.';
      } else if (trimmedName.length < 2 || trimmedName.length > 100) {
        errors.name = 'Name must be between 2 and 100 characters.';
      } else {
        sanitized.name = trimmedName;
      }
    }
  }

  if (Object.hasOwn(body, 'college')) {
    if (typeof body.college !== 'string') {
      errors.college = 'College name must be text.';
    } else {
      const trimmedCollege = body.college.trim();
      if (!trimmedCollege) {
        errors.college = 'College or university name is required.';
      } else if (trimmedCollege.length < 2 || trimmedCollege.length > 150) {
        errors.college = 'College name must be between 2 and 150 characters.';
      } else {
        sanitized.college = trimmedCollege;
      }
    }
  }

  if (Object.hasOwn(body, 'skills')) {
    const result = validateStrictTagArray(body.skills, 'Skills');
    if (result.error) {
      errors.skills = result.error;
    } else {
      sanitized.skills = result.sanitized;
    }
  }

  if (Object.hasOwn(body, 'interests')) {
    const result = validateStrictTagArray(body.interests, 'Interests');
    if (result.error) {
      errors.interests = result.error;
    } else {
      sanitized.interests = result.sanitized;
    }
  }

  if (Object.hasOwn(body, 'profileImage')) {
    if (typeof body.profileImage !== 'string') {
      errors.profileImage = 'Profile image URL must be text.';
    } else {
      const trimmedUrl = body.profileImage.trim();
      if (trimmedUrl.length > MAX_PROFILE_IMAGE_URL_LENGTH) {
        errors.profileImage = `Profile image URL cannot exceed ${MAX_PROFILE_IMAGE_URL_LENGTH} characters.`;
      } else if (trimmedUrl && !isValidHttpUrl(trimmedUrl)) {
        errors.profileImage = 'Please enter a valid http:// or https:// image URL.';
      } else {
        sanitized.profileImage = trimmedUrl;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  };
}
