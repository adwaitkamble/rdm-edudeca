import { Router } from 'express';
import { getMe, updateProfile, syncUser } from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/users/me
router.get('/me', requireAuth, getMe);

// PUT /api/users/profile
router.put('/profile', requireAuth, updateProfile);

// POST /api/users/sync
router.post('/sync', requireAuth, syncUser);

export const userRoutes = router;
