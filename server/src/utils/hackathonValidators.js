import { HACKATHON_MODES, HACKATHON_STATUSES } from '../models/hackathon.model.js';

const MAX_SKILLS_COUNT = 25;
const MAX_CATEGORIES_COUNT = 10;
const MAX_TAG_LENGTH = 50;
const MAX_URL_LENGTH = 500;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ALLOWED_HACKATHON_FIELDS = new Set([
  'title',
  'shortDescription',
  'description',
  'organizerName',
  'organizerLogo',
  'bannerImage',
  'mode',
  'location',
  'startDate',
  'endDate',
  'registrationDeadline',
  'registrationLink',
  'eligibility',
  'prizePool',
  'teamSizeMin',
  'teamSizeMax',
  'requiredSkills',
  'categories',
]);

const PROTECTED_HACKATHON_FIELDS = new Set([
  'createdBy',
  'status',
  'slug',
  'isDemo',
  '_id',
  'id',
  'role',
  'createdAt',
  'updatedAt',
]);

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function parseValidDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function validateTagArray(value, label, { maxCount, allowEmpty }) {
  if (!Array.isArray(value)) {
    return { error: `${label} must be an array of text entries.`, sanitized: null };
  }

  if (!allowEmpty && value.length === 0) {
    return { error: `Please provide at least one entry in ${label.toLowerCase()}.`, sanitized: null };
  }

  if (value.length > maxCount) {
    return { error: `You can add at most ${maxCount} ${label.toLowerCase()}.`, sanitized: null };
  }

  const seen = new Set();
  const sanitized = [];

  for (const item of value) {
    if (typeof item !== 'string') {
      return { error: `All ${label.toLowerCase()} entries must be text.`, sanitized: null };
    }

    const trimmed = item.trim();
    if (!trimmed) {
      return { error: `${label} cannot contain empty entries.`, sanitized: null };
    }

    if (trimmed.length > MAX_TAG_LENGTH) {
      return {
        error: `Each entry in ${label.toLowerCase()} must be ${MAX_TAG_LENGTH} characters or fewer.`,
        sanitized: null,
      };
    }

    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      sanitized.push(trimmed);
    }
  }

  if (!allowEmpty && sanitized.length === 0) {
    return { error: `Please provide at least one valid entry in ${label.toLowerCase()}.`, sanitized: null };
  }

  return { error: null, sanitized };
}

function validateStringField(value, label, { min, max, required }) {
  if (value === undefined || value === null) {
    return required ? { error: `${label} is required.`, sanitized: undefined } : { error: null, sanitized: undefined };
  }

  if (typeof value !== 'string') {
    return { error: `${label} must be text.`, sanitized: undefined };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return required ? { error: `${label} is required.`, sanitized: undefined } : { error: null, sanitized: '' };
  }

  if (trimmed.length < min || trimmed.length > max) {
    return {
      error: `${label} must be between ${min} and ${max} characters.`,
      sanitized: undefined,
    };
  }

  return { error: null, sanitized: trimmed };
}

function validateUrlField(value, label, { required }) {
  if (value === undefined || value === null) {
    return required ? { error: `${label} is required.`, sanitized: undefined } : { error: null, sanitized: undefined };
  }

  if (typeof value !== 'string') {
    return { error: `${label} must be a valid URL string.`, sanitized: undefined };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return required ? { error: `${label} is required.`, sanitized: undefined } : { error: null, sanitized: '' };
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return { error: `${label} cannot exceed ${MAX_URL_LENGTH} characters.`, sanitized: undefined };
  }

  if (!isValidHttpUrl(trimmed)) {
    return { error: `${label} must be a valid http:// or https:// URL.`, sanitized: undefined };
  }

  return { error: null, sanitized: trimmed };
}

function validateTeamSize(value, label) {
  const parsed = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof parsed !== 'number' || !Number.isInteger(parsed) || parsed < 1 || parsed > 10) {
    return { error: `${label} must be a whole number between 1 and 10.`, sanitized: undefined };
  }
  return { error: null, sanitized: parsed };
}

function checkDisallowedFields(body, errors) {
  for (const key of Object.keys(body)) {
    if (!ALLOWED_HACKATHON_FIELDS.has(key)) {
      if (PROTECTED_HACKATHON_FIELDS.has(key)) {
        errors[key] = `The "${key}" field is controlled by the server and cannot be set manually.`;
      } else {
        errors[key] = `Unknown field "${key}" is not allowed.`;
      }
    }
  }
}

export function validateCreateHackathonInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      errors: { body: 'Request body must be a valid JSON object.' },
      sanitized: {},
    };
  }

  const errors = {};
  const sanitized = {};

  checkDisallowedFields(body, errors);

  const stringRules = [
    ['title', 'Title', { min: 3, max: 140, required: true }],
    ['shortDescription', 'Short description', { min: 10, max: 260, required: true }],
    ['description', 'Description', { min: 20, max: 5000, required: true }],
    ['organizerName', 'Organizer name', { min: 2, max: 120, required: true }],
    ['location', 'Location', { min: 2, max: 160, required: true }],
    ['eligibility', 'Eligibility', { min: 3, max: 300, required: true }],
    ['prizePool', 'Prize pool', { min: 1, max: 120, required: true }],
  ];

  for (const [field, label, rule] of stringRules) {
    const res = validateStringField(body[field], label, rule);
    if (res.error) {
      errors[field] = res.error;
    } else if (res.sanitized !== undefined) {
      sanitized[field] = res.sanitized;
    }
  }

  const mode = typeof body.mode === 'string' ? body.mode.trim().toLowerCase() : '';
  if (!HACKATHON_MODES.includes(mode)) {
    errors.mode = `Mode must be one of: ${HACKATHON_MODES.join(', ')}.`;
  } else {
    sanitized.mode = mode;
  }

  const regLinkRes = validateUrlField(body.registrationLink, 'Registration link', { required: true });
  if (regLinkRes.error) {
    errors.registrationLink = regLinkRes.error;
  } else {
    sanitized.registrationLink = regLinkRes.sanitized;
  }

  const bannerRes = validateUrlField(body.bannerImage ?? '', 'Banner image URL', { required: false });
  if (bannerRes.error) {
    errors.bannerImage = bannerRes.error;
  } else {
    sanitized.bannerImage = bannerRes.sanitized;
  }

  const logoRes = validateUrlField(body.organizerLogo ?? '', 'Organizer logo URL', { required: false });
  if (logoRes.error) {
    errors.organizerLogo = logoRes.error;
  } else {
    sanitized.organizerLogo = logoRes.sanitized;
  }

  const startDate = parseValidDate(body.startDate);
  const endDate = parseValidDate(body.endDate);
  const registrationDeadline = parseValidDate(body.registrationDeadline);

  if (!startDate) {
    errors.startDate = 'A valid start date is required.';
  } else {
    sanitized.startDate = startDate;
  }

  if (!endDate) {
    errors.endDate = 'A valid end date is required.';
  } else {
    sanitized.endDate = endDate;
  }

  if (!registrationDeadline) {
    errors.registrationDeadline = 'A valid registration deadline is required.';
  } else {
    sanitized.registrationDeadline = registrationDeadline;
  }

  if (startDate && endDate && endDate <= startDate) {
    errors.endDate = 'End date must be after start date.';
  }

  if (endDate && registrationDeadline && registrationDeadline > endDate) {
    errors.registrationDeadline = 'Registration deadline cannot be after the event end date.';
  }

  const minRes = validateTeamSize(body.teamSizeMin ?? 1, 'Minimum team size');
  const maxRes = validateTeamSize(body.teamSizeMax ?? 4, 'Maximum team size');

  if (minRes.error) {
    errors.teamSizeMin = minRes.error;
  } else {
    sanitized.teamSizeMin = minRes.sanitized;
  }

  if (maxRes.error) {
    errors.teamSizeMax = maxRes.error;
  } else {
    sanitized.teamSizeMax = maxRes.sanitized;
  }

  if (!minRes.error && !maxRes.error && maxRes.sanitized < minRes.sanitized) {
    errors.teamSizeMax = 'Maximum team size must be greater than or equal to minimum team size.';
  }

  const skillsRes = validateTagArray(body.requiredSkills ?? [], 'Required skills', {
    maxCount: MAX_SKILLS_COUNT,
    allowEmpty: true,
  });
  if (skillsRes.error) {
    errors.requiredSkills = skillsRes.error;
  } else {
    sanitized.requiredSkills = skillsRes.sanitized;
  }

  const categoriesRes = validateTagArray(body.categories, 'Categories', {
    maxCount: MAX_CATEGORIES_COUNT,
    allowEmpty: false,
  });
  if (categoriesRes.error) {
    errors.categories = categoriesRes.error;
  } else {
    sanitized.categories = categoriesRes.sanitized;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  };
}

export function validateUpdateHackathonInput(body, existingHackathon) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      isValid: false,
      errors: { body: 'Request body must be a valid JSON object.' },
      sanitized: {},
    };
  }

  const errors = {};
  const sanitized = {};

  checkDisallowedFields(body, errors);

  const updatableKeys = Object.keys(body).filter((key) => ALLOWED_HACKATHON_FIELDS.has(key));
  if (updatableKeys.length === 0 && Object.keys(errors).length === 0) {
    errors.general = 'Provide at least one hackathon field to update.';
  }

  const stringRules = [
    ['title', 'Title', { min: 3, max: 140, required: true }],
    ['shortDescription', 'Short description', { min: 10, max: 260, required: true }],
    ['description', 'Description', { min: 20, max: 5000, required: true }],
    ['organizerName', 'Organizer name', { min: 2, max: 120, required: true }],
    ['location', 'Location', { min: 2, max: 160, required: true }],
    ['eligibility', 'Eligibility', { min: 3, max: 300, required: true }],
    ['prizePool', 'Prize pool', { min: 1, max: 120, required: true }],
  ];

  for (const [field, label, rule] of stringRules) {
    if (Object.hasOwn(body, field)) {
      const res = validateStringField(body[field], label, rule);
      if (res.error) {
        errors[field] = res.error;
      } else {
        sanitized[field] = res.sanitized;
      }
    }
  }

  if (Object.hasOwn(body, 'mode')) {
    const mode = typeof body.mode === 'string' ? body.mode.trim().toLowerCase() : '';
    if (!HACKATHON_MODES.includes(mode)) {
      errors.mode = `Mode must be one of: ${HACKATHON_MODES.join(', ')}.`;
    } else {
      sanitized.mode = mode;
    }
  }

  if (Object.hasOwn(body, 'registrationLink')) {
    const res = validateUrlField(body.registrationLink, 'Registration link', { required: true });
    if (res.error) {
      errors.registrationLink = res.error;
    } else {
      sanitized.registrationLink = res.sanitized;
    }
  }

  if (Object.hasOwn(body, 'bannerImage')) {
    const res = validateUrlField(body.bannerImage, 'Banner image URL', { required: false });
    if (res.error) {
      errors.bannerImage = res.error;
    } else {
      sanitized.bannerImage = res.sanitized;
    }
  }

  if (Object.hasOwn(body, 'organizerLogo')) {
    const res = validateUrlField(body.organizerLogo, 'Organizer logo URL', { required: false });
    if (res.error) {
      errors.organizerLogo = res.error;
    } else {
      sanitized.organizerLogo = res.sanitized;
    }
  }

  if (Object.hasOwn(body, 'startDate')) {
    const parsed = parseValidDate(body.startDate);
    if (!parsed) {
      errors.startDate = 'A valid start date is required.';
    } else {
      sanitized.startDate = parsed;
    }
  }

  if (Object.hasOwn(body, 'endDate')) {
    const parsed = parseValidDate(body.endDate);
    if (!parsed) {
      errors.endDate = 'A valid end date is required.';
    } else {
      sanitized.endDate = parsed;
    }
  }

  if (Object.hasOwn(body, 'registrationDeadline')) {
    const parsed = parseValidDate(body.registrationDeadline);
    if (!parsed) {
      errors.registrationDeadline = 'A valid registration deadline is required.';
    } else {
      sanitized.registrationDeadline = parsed;
    }
  }

  const effectiveStart = sanitized.startDate || existingHackathon.startDate;
  const effectiveEnd = sanitized.endDate || existingHackathon.endDate;
  const effectiveDeadline = sanitized.registrationDeadline || existingHackathon.registrationDeadline;

  if (!errors.startDate && !errors.endDate && effectiveEnd <= effectiveStart) {
    errors.endDate = 'End date must be after start date.';
  }

  if (!errors.endDate && !errors.registrationDeadline && effectiveDeadline > effectiveEnd) {
    errors.registrationDeadline = 'Registration deadline cannot be after the event end date.';
  }

  if (Object.hasOwn(body, 'teamSizeMin')) {
    const res = validateTeamSize(body.teamSizeMin, 'Minimum team size');
    if (res.error) {
      errors.teamSizeMin = res.error;
    } else {
      sanitized.teamSizeMin = res.sanitized;
    }
  }

  if (Object.hasOwn(body, 'teamSizeMax')) {
    const res = validateTeamSize(body.teamSizeMax, 'Maximum team size');
    if (res.error) {
      errors.teamSizeMax = res.error;
    } else {
      sanitized.teamSizeMax = res.sanitized;
    }
  }

  const effectiveMin = sanitized.teamSizeMin ?? existingHackathon.teamSizeMin;
  const effectiveMax = sanitized.teamSizeMax ?? existingHackathon.teamSizeMax;
  if (!errors.teamSizeMin && !errors.teamSizeMax && effectiveMax < effectiveMin) {
    errors.teamSizeMax = 'Maximum team size must be greater than or equal to minimum team size.';
  }

  if (Object.hasOwn(body, 'requiredSkills')) {
    const res = validateTagArray(body.requiredSkills, 'Required skills', {
      maxCount: MAX_SKILLS_COUNT,
      allowEmpty: true,
    });
    if (res.error) {
      errors.requiredSkills = res.error;
    } else {
      sanitized.requiredSkills = res.sanitized;
    }
  }

  if (Object.hasOwn(body, 'categories')) {
    const res = validateTagArray(body.categories, 'Categories', {
      maxCount: MAX_CATEGORIES_COUNT,
      allowEmpty: false,
    });
    if (res.error) {
      errors.categories = res.error;
    } else {
      sanitized.categories = res.sanitized;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  };
}

export function isValidSlug(slug) {
  return typeof slug === 'string' && SLUG_REGEX.test(slug.trim().toLowerCase());
}

export function validateHackathonListQuery(query = {}) {
  const errors = {};

  const search = typeof query.search === 'string' ? query.search.trim().slice(0, 120) : '';
  const mode = typeof query.mode === 'string' ? query.mode.trim().toLowerCase() : '';
  const status = typeof query.status === 'string' ? query.status.trim().toLowerCase() : '';
  const category = typeof query.category === 'string' ? query.category.trim().slice(0, 60) : '';
  const skillsRaw = typeof query.skills === 'string' ? query.skills.trim() : '';
  const sort = typeof query.sort === 'string' ? query.sort.trim() : 'upcoming';

  if (mode && !HACKATHON_MODES.includes(mode)) {
    errors.mode = `Mode filter must be one of: ${HACKATHON_MODES.join(', ')}.`;
  }

  if (status && !HACKATHON_STATUSES.includes(status)) {
    errors.status = `Status filter must be one of: ${HACKATHON_STATUSES.join(', ')}.`;
  }

  const allowedSorts = ['upcoming', 'deadline', 'newest'];
  if (sort && !allowedSorts.includes(sort)) {
    errors.sort = `Sort option must be one of: ${allowedSorts.join(', ')}.`;
  }

  const pageParsed = Number.parseInt(query.page || '1', 10);
  const limitParsed = Number.parseInt(query.limit || '9', 10);

  const page = Number.isNaN(pageParsed) || pageParsed < 1 ? 1 : pageParsed;
  const limit = Number.isNaN(limitParsed) || limitParsed < 1 ? 9 : Math.min(limitParsed, 50);

  const skills = skillsRaw
    ? skillsRaw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 10)
    : [];

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    filters: {
      search,
      mode,
      status,
      category,
      skills,
      sort: sort || 'upcoming',
      page,
      limit,
    },
  };
}
