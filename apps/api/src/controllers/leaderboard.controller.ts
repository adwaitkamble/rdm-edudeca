import { Request, Response } from 'express';
import { QuizAttemptModel } from '../models/QuizAttempt';
import { LeaderboardEntry } from '@edudeca/types';

export const getLeaderboardByLevel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const levelNumber = parseInt(req.params.level, 10) || 1;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));

    // High-performance 7-stage Mongoose aggregation pipeline
    const aggregatedRanks = await QuizAttemptModel.aggregate([
      // Stage 1 ($match): Filter attempts by the requested level
      {
        $match: {
          level: levelNumber,
        },
      },
      // Stage 2 ($sort): Sort matched attempts by score (descending) and timeTaken (ascending)
      {
        $sort: {
          score: -1,
          timeTaken: 1,
        },
      },
      // Stage 3 ($group): Group by userId to capture the user's best score, fastest time, and timestamp
      {
        $group: {
          _id: '$userId',
          bestScore: { $first: '$score' },
          total: { $first: '$total' },
          totalQuestions: { $first: '$totalQuestions' },
          bestTime: { $first: '$timeTaken' },
          completedAt: { $first: '$completedAt' },
        },
      },
      // Stage 4 ($lookup): Join the User collection to retrieve user profile details
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      // Stage 5 ($unwind): Deconstruct joined user array
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Stage 6 ($sort): Re-sort grouped results by best score (descending) and best time (ascending)
      {
        $sort: {
          bestScore: -1,
          bestTime: 1,
        },
      },
      // Stage 7 ($limit): Cap results to top N entries
      {
        $limit: limit,
      },
    ]);

    const colors = ['teal', 'amber', 'purple', 'blue', 'pink'];

    // Map and shape output to strictly match the LeaderboardEntry interface
    const rankings: LeaderboardEntry[] = aggregatedRanks.map((item, index) => {
      const minutes = Math.floor((item.bestTime || 0) / 60);
      const seconds = (item.bestTime || 0) % 60;
      const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}s`;
      const questionTotal = item.total || item.totalQuestions || 10;

      return {
        rank: index + 1,
        userId: item._id,
        name: item.user?.name || `Whiz Student #${index + 1}`,
        score: `${item.bestScore}/${questionTotal}`,
        time: formattedTime,
        rawScore: item.bestScore,
        rawTime: item.bestTime,
        color: colors[index % colors.length],
        institution: item.user?.institution || 'Top Whiz Institute',
      };
    });

    res.status(200).json({
      success: true,
      level: levelNumber,
      totalParticipants: rankings.length,
      data: rankings,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Leaderboard Controller] Aggregation error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to aggregate leaderboard.',
    });
  }
};
