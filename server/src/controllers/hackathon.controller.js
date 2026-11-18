import {
  createHackathon,
  deleteHackathonById,
  findHackathonDocumentById,
  getHackathonBySlug,
  listHackathons,
  updateHackathonById,
} from '../services/hackathon.service.js';
import AppError from '../utils/appError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import {
  validateCreateHackathonInput,
  validateHackathonListQuery,
  validateUpdateHackathonInput,
} from '../utils/hackathonValidators.js';

export async function getAllHackathons(req, res, next) {
  try {
    const { isValid, errors, filters } = validateHackathonListQuery(req.query);

    if (!isValid) {
      throw new AppError(400, 'Invalid hackathon query parameters.', errors);
    }

    const result = await listHackathons(filters);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Hackathons fetched successfully',
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getHackathonDetails(req, res, next) {
  try {
    const hackathon = await getHackathonBySlug(req.params.slug);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Hackathon details fetched successfully',
      data: { hackathon },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createNewHackathon(req, res, next) {
  try {
    const { isValid, errors, sanitized } = validateCreateHackathonInput(req.body);

    if (!isValid) {
      throw new AppError(400, 'Please fix the hackathon validation errors and try again.', errors);
    }

    const hackathon = await createHackathon(sanitized, req.user.id);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Hackathon created successfully',
      data: { hackathon },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateExistingHackathon(req, res, next) {
  try {
    const existing = await findHackathonDocumentById(req.params.id);
    const { isValid, errors, sanitized } = validateUpdateHackathonInput(req.body, existing);

    if (!isValid) {
      throw new AppError(400, 'Please fix the hackathon validation errors and try again.', errors);
    }

    const hackathon = await updateHackathonById(existing, sanitized);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Hackathon updated successfully',
      data: { hackathon },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteExistingHackathon(req, res, next) {
  try {
    const deleted = await deleteHackathonById(req.params.id);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Hackathon deleted successfully',
      data: { deleted },
    });
  } catch (error) {
    return next(error);
  }
}
