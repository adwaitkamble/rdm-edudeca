import { Router } from 'express';
import { submitBatchReferrals, getMyReferrals } from '../controllers/referral.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/referrals/batch
router.post('/batch', requireAuth, submitBatchReferrals);

// GET /api/referrals/me
router.get('/me', requireAuth, getMyReferrals);

export const referralRoutes = router;
