import { Router } from 'express';
import { submitQuiz, getUserAttempts } from '../controllers/quiz.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// POST /api/quizzes/submit
router.post('/submit', requireAuth, submitQuiz);

// GET /api/quizzes/history
router.get('/history', requireAuth, getUserAttempts);

export const quizRoutes = router;
