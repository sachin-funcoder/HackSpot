import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Hackathon, { computeHackathonStatus } from '../models/hackathon.model.js';
import AppError from '../utils/appError.js';
import { isValidSlug } from '../utils/hackathonValidators.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function slugifyTitle(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  return base || 'hackathon';
}

async function generateUniqueSlug(title) {
  const baseSlug = slugifyTitle(title);
  let candidate = baseSlug;
  let attempts = 0;

  while (attempts < 10) {
    const existing = await Hackathon.exists({ slug: candidate });
    if (!existing) {
      return candidate;
    }
    const suffix = crypto.randomBytes(2).toString('hex');
    candidate = `${baseSlug}-${suffix}`;
    attempts += 1;
  }

  return `${baseSlug}-${Date.now().toString(36)}`;
}

export function serializeHackathon(doc) {
  const createdBy =
    doc.createdBy && typeof doc.createdBy === 'object' && doc.createdBy._id
      ? {
          id: doc.createdBy._id.toString(),
          name: doc.createdBy.name,
        }
      : doc.createdBy
        ? doc.createdBy.toString()
        : null;

  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    shortDescription: doc.shortDescription,
    description: doc.description,
    organizerName: doc.organizerName,
    organizerLogo: doc.organizerLogo || '',
    bannerImage: doc.bannerImage || '',
    mode: doc.mode,
    location: doc.location,
    startDate: doc.startDate,
    endDate: doc.endDate,
    registrationDeadline: doc.registrationDeadline,
    registrationLink: doc.registrationLink,
    eligibility: doc.eligibility,
    prizePool: doc.prizePool,
    teamSizeMin: doc.teamSizeMin,
    teamSizeMax: doc.teamSizeMax,
    requiredSkills: doc.requiredSkills || [],
    categories: doc.categories || [],
    status: computeHackathonStatus(doc.startDate, doc.endDate),
    isDemo: Boolean(doc.isDemo),
    createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listHackathons(filters) {
  const { search, mode, status, category, skills, sort, page, limit } = filters;
  const now = new Date();
  const conditions = [];

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    conditions.push({
      $or: [
        { title: regex },
        { shortDescription: regex },
        { description: regex },
        { organizerName: regex },
        { categories: regex },
        { requiredSkills: regex },
      ],
    });
  }

  if (mode) {
    conditions.push({ mode });
  }

  if (category) {
    conditions.push({ categories: new RegExp(`^${escapeRegex(category)}$`, 'i') });
  }

  if (skills && skills.length > 0) {
    const skillRegexes = skills.map((skill) => new RegExp(escapeRegex(skill), 'i'));
    conditions.push({ requiredSkills: { $in: skillRegexes } });
  }

  if (status === 'upcoming') {
    conditions.push({ startDate: { $gt: now } });
  } else if (status === 'ongoing') {
    conditions.push({ startDate: { $lte: now }, endDate: { $gte: now } });
  } else if (status === 'completed') {
    conditions.push({ endDate: { $lt: now } });
  }

  const query = conditions.length > 0 ? { $and: conditions } : {};

  let sortOptions = { startDate: 1, createdAt: -1 };
  if (sort === 'deadline') {
    sortOptions = { registrationDeadline: 1, startDate: 1 };
  } else if (sort === 'newest') {
    sortOptions = { createdAt: -1 };
  }

  const skip = (page - 1) * limit;

  const [items, total, distinctCategories, upcomingCount, ongoingCount, completedCount] =
    await Promise.all([
      Hackathon.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name'),
      Hackathon.countDocuments(query),
      Hackathon.distinct('categories'),
      Hackathon.countDocuments({ startDate: { $gt: now } }),
      Hackathon.countDocuments({ startDate: { $lte: now }, endDate: { $gte: now } }),
      Hackathon.countDocuments({ endDate: { $lt: now } }),
    ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    hackathons: items.map(serializeHackathon),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    meta: {
      availableCategories: distinctCategories.sort((a, b) => a.localeCompare(b)),
      counts: {
        total: upcomingCount + ongoingCount + completedCount,
        upcoming: upcomingCount,
        ongoing: ongoingCount,
        completed: completedCount,
      },
    },
  };
}

export async function getHackathonBySlug(slug) {
  if (!isValidSlug(slug)) {
    throw new AppError(400, 'Invalid hackathon slug format.');
  }

  const hackathon = await Hackathon.findOne({ slug: slug.trim().toLowerCase() }).populate(
    'createdBy',
    'name',
  );

  if (!hackathon) {
    throw new AppError(404, 'Hackathon not found.');
  }

  return serializeHackathon(hackathon);
}

export async function createHackathon(data, adminUserId) {
  const slug = await generateUniqueSlug(data.title);
  const status = computeHackathonStatus(data.startDate, data.endDate);

  const created = await Hackathon.create({
    ...data,
    slug,
    status,
    isDemo: false,
    createdBy: adminUserId,
  });

  await created.populate('createdBy', 'name');
  return serializeHackathon(created);
}

export async function findHackathonDocumentById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid hackathon ID format.');
  }

  const hackathon = await Hackathon.findById(id);
  if (!hackathon) {
    throw new AppError(404, 'Hackathon not found.');
  }

  return hackathon;
}

export async function updateHackathonById(hackathonDoc, updates) {
  for (const [key, value] of Object.entries(updates)) {
    hackathonDoc[key] = value;
  }

  hackathonDoc.status = computeHackathonStatus(hackathonDoc.startDate, hackathonDoc.endDate);

  await hackathonDoc.save();
  await hackathonDoc.populate('createdBy', 'name');

  return serializeHackathon(hackathonDoc);
}

export async function deleteHackathonById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, 'Invalid hackathon ID format.');
  }

  const deleted = await Hackathon.findByIdAndDelete(id);
  if (!deleted) {
    throw new AppError(404, 'Hackathon not found.');
  }

  return {
    id: deleted._id.toString(),
    title: deleted.title,
    slug: deleted.slug,
  };
}
