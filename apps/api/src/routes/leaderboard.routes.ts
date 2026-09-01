import { Router } from 'express';
import {
  getLeaderboardByLevel,
  getGlobalLeaderboard,
} from '../controllers/leaderboard.controller';

const router = Router();

// GET /api/leaderboards/global/overall
router.get('/global/overall', getGlobalLeaderboard);

// GET /api/leaderboards/:level
router.get('/:level', getLeaderboardByLevel);

export const leaderboardRoutes = router;
