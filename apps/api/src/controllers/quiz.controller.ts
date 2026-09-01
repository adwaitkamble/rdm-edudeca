import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { QuizAttemptModel } from '../models/QuizAttempt';
import { UserModel } from '../models/User';
import { QuizSubmissionPayload, QuizSubmissionResponse } from '@edudeca/types';

export const submitQuiz = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.body.userId || req.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized: User ID is required.' });
      return;
    }

    const {
      level,
      score,
      total = 10,
      totalQuestions = 10,
      accuracy: clientAccuracy,
      earnedRdm: clientEarnedRdm,
      timeTaken,
      passed: clientPassed,
      disciplineBreakdown = [],
    }: QuizSubmissionPayload = req.body;

    if (level === undefined || score === undefined || timeTaken === undefined) {
      res.status(400).json({
        success: false,
        error: 'Missing required quiz submission fields: level, score, timeTaken.',
      });
      return;
    }

    const questionCount = total || totalQuestions || 10;
    const accuracy =
      clientAccuracy !== undefined
        ? clientAccuracy
        : Math.min(100, Math.max(0, Math.round((score / questionCount) * 100)));

    const isPassed = clientPassed !== undefined ? clientPassed : accuracy >= 70;

    // Calculate RDM coin rewards: 10 RDM per correct answer + 50 bonus RDM if passed
    const earnedRdm =
      clientEarnedRdm !== undefined
        ? clientEarnedRdm
        : score * 10 + (isPassed ? 50 : 0);

    // 1. Create and persist new QuizAttempt document
    const attempt = await QuizAttemptModel.create({
      userId,
      level: Number(level),
      score: Number(score),
      total: Number(questionCount),
      totalQuestions: Number(questionCount),
      accuracy,
      earnedRdm,
      timeTaken: Number(timeTaken),
      passed: isPassed,
      disciplineBreakdown,
      completedAt: new Date(),
    });

    // 2. Fetch current user state to calculate level progression
    const existingUser = await UserModel.findById(userId);
    const currentLevel = existingUser?.level || 0;
    let leveledUp = false;
    let newLevel = currentLevel;

    if (isPassed && Number(level) >= currentLevel) {
      newLevel = Number(level);
      if (newLevel > currentLevel) {
        leveledUp = true;
      }
    }

    // 3. Perform atomic MongoDB update using $inc and $set
    const updateOps: Record<string, any> = {
      $inc: {
        rdmBalance: earnedRdm,
        quizzesCompleted: 1,
        streak: 1,
      },
    };

    if (leveledUp || newLevel > currentLevel) {
      updateOps.$set = { level: newLevel };
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateOps, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    const response: QuizSubmissionResponse = {
      success: true,
      attempt: attempt.toJSON() as any,
      user: updatedUser?.toJSON() as any,
      leveledUp,
      newLevel,
    };

    res.status(201).json(response);
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Quiz Controller] Error submitting quiz:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to process quiz submission.',
    });
  }
};

export const getUserAttempts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.body.userId || req.userId;
    const level = req.query.level ? Number(req.query.level) : null;

    const filter: Record<string, any> = { userId };
    if (level) filter.level = level;

    const attempts = await QuizAttemptModel.find(filter)
      .sort({ completedAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: attempts.map((a) => a.toJSON()),
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Quiz Controller] Error fetching attempts:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve quiz history.',
    });
  }
};
