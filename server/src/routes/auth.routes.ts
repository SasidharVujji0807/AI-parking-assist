import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getMe, updateProfile } from '../controllers/auth.controller';

const router = Router();

router.get('/me', requireAuth, getMe);
router.patch('/profile', requireAuth, updateProfile);

export default router;
