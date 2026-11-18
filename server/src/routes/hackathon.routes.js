import { Router } from 'express';
import {
  createNewHackathon,
  deleteExistingHackathon,
  getAllHackathons,
  getHackathonDetails,
  updateExistingHackathon,
} from '../controllers/hackathon.controller.js';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Public & student discovery endpoints
router.get('/', getAllHackathons);
router.get('/:slug', getHackathonDetails);

// Admin-only hackathon management endpoints
router.post('/', authenticate, authorizeRoles('admin'), createNewHackathon);
router.patch('/:id', authenticate, authorizeRoles('admin'), updateExistingHackathon);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteExistingHackathon);

export default router;
