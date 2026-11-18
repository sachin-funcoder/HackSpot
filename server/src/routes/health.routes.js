import { Router } from 'express';
import { getDatabaseHealthStatus, getHealthStatus } from '../controllers/health.controller.js';

const router = Router();

router.get('/', getHealthStatus);
router.get('/db', getDatabaseHealthStatus);

export default router;
