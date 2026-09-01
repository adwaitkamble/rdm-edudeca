import { Router } from 'express';
import { getLeaderboardByLevel } from '../controllers/leaderboard.controller';

const router = Router();

// GET /api/leaderboards/:level
router.get('/:level', getLeaderboardByLevel);

export const leaderboardRoutes = router;
