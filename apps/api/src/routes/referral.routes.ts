import { Router } from 'express';
import {
  submitBatchReferrals,
  getMyReferrals,
  getMyRoom,
  getRoomByCode,
  joinRoom,
  getJoinedRoom,
} from '../controllers/referral.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/referrals/batch
router.post('/batch', requireAuth, submitBatchReferrals);

// GET /api/referrals/me
router.get('/me', requireAuth, getMyReferrals);

// Community Squad Room Routes
// GET /api/referrals/my-room
router.get('/my-room', requireAuth, getMyRoom);

// GET /api/referrals/joined-room
router.get('/joined-room', requireAuth, getJoinedRoom);

// GET /api/referrals/room/:code
router.get('/room/:code', requireAuth, getRoomByCode);

// POST /api/referrals/join-room
router.post('/join-room', requireAuth, joinRoom);

export const referralRoutes = router;
