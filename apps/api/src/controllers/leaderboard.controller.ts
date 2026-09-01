import { Request, Response } from 'express';
import { QuizAttemptModel } from '../models/QuizAttempt';
import { UserModel } from '../models/User';
import { LeaderboardEntry } from '@edudeca/types';

// Diverse set of national benchmark student competitors across Indian institutions
const BENCHMARK_STUDENTS = [
  { id: 'bm_01', name: 'Aryan Deshmukh', institution: 'Viswa Vignan Jr College, Pune', score: 10, total: 10, time: 26, rdm: 520, level: 3, color: 'teal' },
  { id: 'bm_02', name: 'Ananya Rao', institution: 'FIITJEE Jr College, Hyderabad', score: 10, total: 10, time: 31, rdm: 480, level: 3, color: 'purple' },
  { id: 'bm_03', name: 'Rohan Mehta', institution: 'Delhi Public School, R.K. Puram', score: 10, total: 10, time: 36, rdm: 450, level: 2, color: 'blue' },
  { id: 'bm_04', name: 'Sneha Patil', institution: 'Fergusson College, Pune', score: 9, total: 10, time: 28, rdm: 410, level: 2, color: 'pink' },
  { id: 'bm_05', name: 'Kavya Iyer', institution: 'National Public School, Bangalore', score: 9, total: 10, time: 34, rdm: 390, level: 2, color: 'amber' },
  { id: 'bm_06', name: 'Aditya Verma', institution: 'DAV Boys Senior Secondary, Chennai', score: 9, total: 10, time: 39, rdm: 350, level: 1, color: 'teal' },
  { id: 'bm_07', name: 'Tanvi Sharma', institution: 'Modern School, Barakhamba Road', score: 8, total: 10, time: 29, rdm: 320, level: 1, color: 'purple' },
  { id: 'bm_08', name: 'Yash Joshi', institution: 'St. Xavier’s College, Mumbai', score: 8, total: 10, time: 42, rdm: 290, level: 1, color: 'blue' },
  { id: 'bm_09', name: 'Pooja Nair', institution: 'Chinmaya Vidyalaya, Kochi', score: 8, total: 10, time: 47, rdm: 260, level: 1, color: 'pink' },
  { id: 'bm_10', name: 'Manish Gupta', institution: 'City Montessori School, Lucknow', score: 7, total: 10, time: 35, rdm: 220, level: 1, color: 'amber' },
];

export const getLeaderboardByLevel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const levelNumber = parseInt(req.params.level, 10) || 1;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
    const activeUserId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || '';

    // Aggregate real attempts from MongoDB for the requested level
    const aggregatedRanks = await QuizAttemptModel.aggregate([
      {
        $match: {
          level: levelNumber,
        },
      },
      {
        $sort: {
          score: -1,
          timeTaken: 1,
        },
      },
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
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    const liveEntries: Array<{
      userId: string;
      name: string;
      institution: string;
      rawScore: number;
      rawTime: number;
      total: number;
      color: string;
      isCurrentUser: boolean;
      rdmBalance?: number;
      level?: number;
    }> = aggregatedRanks.map((item, idx) => ({
      userId: String(item._id),
      name: item.user?.name || `Student Whiz #${idx + 1}`,
      institution: item.user?.institution || 'Top Whiz Institute',
      rawScore: item.bestScore,
      rawTime: item.bestTime,
      total: item.total || item.totalQuestions || 10,
      color: ['teal', 'amber', 'purple', 'blue', 'pink'][idx % 5],
      isCurrentUser: String(item._id) === activeUserId,
      rdmBalance: item.user?.rdmBalance,
      level: item.user?.level,
    }));

    // If current logged-in user has a profile in DB but no attempt yet for this level, include them at starting score
    if (activeUserId && !liveEntries.some((e) => e.userId === activeUserId)) {
      const activeUser = await UserModel.findById(activeUserId);
      if (activeUser && activeUser.institution) {
        liveEntries.push({
          userId: activeUser._id,
          name: activeUser.name,
          institution: activeUser.institution,
          rawScore: 0,
          rawTime: 99,
          total: 10,
          color: 'teal',
          isCurrentUser: true,
          rdmBalance: activeUser.rdmBalance,
          level: activeUser.level,
        });
      }
    }

    // Merge benchmark competitors so the competition is always rich and dynamic
    const mergedList = [...liveEntries];
    for (const bm of BENCHMARK_STUDENTS) {
      if (!mergedList.some((e) => e.name.toLowerCase() === bm.name.toLowerCase())) {
        mergedList.push({
          userId: bm.id,
          name: bm.name,
          institution: bm.institution,
          rawScore: bm.score,
          rawTime: bm.time,
          total: bm.total,
          color: bm.color,
          isCurrentUser: false,
          rdmBalance: bm.rdm,
          level: bm.level,
        });
      }
    }

    // Sort strictly by: 1) Score descending, 2) Time taken ascending
    mergedList.sort((a, b) => {
      if (b.rawScore !== a.rawScore) {
        return b.rawScore - a.rawScore;
      }
      return a.rawTime - b.rawTime;
    });

    // Map into standard LeaderboardEntry with sequential ranks
    const rankings: LeaderboardEntry[] = mergedList.slice(0, limit).map((item, index) => {
      const minutes = Math.floor((item.rawTime || 0) / 60);
      const seconds = (item.rawTime || 0) % 60;
      const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}s`;

      return {
        rank: index + 1,
        userId: item.userId,
        name: item.name,
        score: `${item.rawScore}/${item.total}`,
        time: formattedTime,
        rawScore: item.rawScore,
        rawTime: item.rawTime,
        color: item.color,
        institution: item.institution,
        isCurrentUser: item.isCurrentUser,
        rdmBalance: item.rdmBalance,
        level: item.level,
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

export const getGlobalLeaderboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
    const activeUserId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || '';

    // Fetch all real users from MongoDB sorted by rdmBalance descending
    const dbUsers = await UserModel.find({})
      .sort({ rdmBalance: -1, level: -1, streak: -1 })
      .limit(limit);

    const colors = ['teal', 'gold', 'purple', 'blue', 'pink', 'amber'];

    const userList: Array<{
      userId: string;
      name: string;
      institution: string;
      rdmBalance: number;
      level: number;
      streak: number;
      isCurrentUser: boolean;
      color: string;
    }> = dbUsers.map((u, idx) => ({
      userId: u._id,
      name: u.name || 'Whiz Student',
      institution: u.institution || 'Top Whiz Institute',
      rdmBalance: u.rdmBalance || 0,
      level: u.level || 1,
      streak: u.streak || 0,
      isCurrentUser: u._id === activeUserId,
      color: colors[idx % colors.length],
    }));

    // Merge benchmark national leaders
    for (let i = 0; i < BENCHMARK_STUDENTS.length; i++) {
      const bm = BENCHMARK_STUDENTS[i];
      if (!userList.some((u) => u.name.toLowerCase() === bm.name.toLowerCase())) {
        userList.push({
          userId: bm.id,
          name: bm.name,
          institution: bm.institution,
          rdmBalance: bm.rdm,
          level: bm.level,
          streak: Math.min(15, bm.level * 3 + 2),
          isCurrentUser: false,
          color: bm.color,
        });
      }
    }

    // Sort by RDM balance descending, then Level descending
    userList.sort((a, b) => {
      if (b.rdmBalance !== a.rdmBalance) {
        return b.rdmBalance - a.rdmBalance;
      }
      return b.level - a.level;
    });

    const rankings: LeaderboardEntry[] = userList.slice(0, limit).map((u, idx) => ({
      rank: idx + 1,
      userId: u.userId,
      name: u.name,
      score: `${u.rdmBalance.toLocaleString('en-IN')} RDM`,
      time: `Lv ${Math.max(1, u.level)} · 🔥 ${u.streak}d`,
      rawScore: u.rdmBalance,
      rawTime: u.level,
      color: u.color,
      institution: u.institution,
      isCurrentUser: u.isCurrentUser,
      rdmBalance: u.rdmBalance,
      level: u.level,
    }));

    res.status(200).json({
      success: true,
      totalParticipants: rankings.length,
      data: rankings,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[Leaderboard Controller] Global ranking error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve national leaderboard.',
    });
  }
};

