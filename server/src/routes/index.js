import { Router } from 'express';
import authRoutes from './auth.routes.js';
import hackathonRoutes from './hackathon.routes.js';
import healthRoutes from './health.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/hackathons', hackathonRoutes);

export default router;
