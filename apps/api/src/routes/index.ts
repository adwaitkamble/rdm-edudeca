import { Router } from 'express';
import { userRoutes } from './user.routes';
import { quizRoutes } from './quiz.routes';
import { leaderboardRoutes } from './leaderboard.routes';
import { referralRoutes } from './referral.routes';
import { webhookRoutes } from './webhook.routes';

const router = Router();

router.use('/users', userRoutes);
router.use('/quizzes', quizRoutes);
router.use('/leaderboards', leaderboardRoutes);
router.use('/referrals', referralRoutes);
router.use('/webhooks', webhookRoutes);

export const apiRoutes = router;
