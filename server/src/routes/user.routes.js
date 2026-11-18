import { Router } from 'express';
import { getMe, getPublicProfile, updateMe } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All user profile endpoints require authentication
router.use(authenticate);

// Keep /me routes registered before /:id
router.get('/me', getMe);
router.patch('/me', updateMe);
router.get('/:id', getPublicProfile);

export default router;
