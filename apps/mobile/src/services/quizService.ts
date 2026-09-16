import { edudecaApi, ChallengeQuestion, ChallengeCompleteResponse } from './edudecaApi';
import {
  Question,
  DisciplineTag,
  AccentColorKey,
  QuizSubmissionPayload,
  QuizSubmissionResponse,
  IQuizAttempt,
} from '@edudeca/types';
import { supabase } from '../lib/supabase';

const DISCIPLINE_MAP: Record<string, { tag: DisciplineTag; color: AccentColorKey }> = {
  phy: { tag: 'PHYSICS', color: 'teal' },
  physics: { tag: 'PHYSICS', color: 'teal' },
  che: { tag: 'CHEMISTRY', color: 'amber' },
  chemistry: { tag: 'CHEMISTRY', color: 'amber' },
  mat: { tag: 'MATHS', color: 'purple' },
  maths: { tag: 'MATHS', color: 'purple' },
  amat: { tag: 'APPLIED MATH', color: 'blue' },
  'applied math': { tag: 'APPLIED MATH', color: 'blue' },
  bio: { tag: 'BIOLOGY', color: 'pink' },
  biology: { tag: 'BIOLOGY', color: 'pink' },
  biotech: { tag: 'BIOTECHNOLOGY', color: 'teal' },
  biotechnology: { tag: 'BIOTECHNOLOGY', color: 'teal' },
  ent: { tag: 'ENTREPRENEURSHIP', color: 'gold' },
  entrepreneurship: { tag: 'ENTREPRENEURSHIP', color: 'gold' },
  eng: { tag: 'VERBAL', color: 'blue' },
  verbal: { tag: 'VERBAL', color: 'blue' },
  eco: { tag: 'QUANTITATIVE', color: 'amber' },
  quantitative: { tag: 'QUANTITATIVE', color: 'amber' },
  log: { tag: 'ANALYTICAL', color: 'purple' },
  analytical: { tag: 'ANALYTICAL', color: 'purple' },
  gk: { tag: 'GK', color: 'teal' },
  fin: { tag: 'FINLIT', color: 'gold' },
  finlit: { tag: 'FINLIT', color: 'gold' },
};

/**
 * Maps server challenge questions to the mobile app's Question format.
 */
const mapServerQuestion = (sq: ChallengeQuestion): Question => {
  const key = (sq.discipline || '').toLowerCase().trim();
  const mapping = DISCIPLINE_MAP[key] || { tag: 'PHYSICS', color: 'teal' };
  return {
    tag: mapping.tag,
    color: mapping.color,
    q: sq.question,
    options: sq.options,
    correctIndex: sq.correct_index,
  };
};

export const quizService = {
  /**
   * Fetches challenge questions from the EduDeca website API.
   * Server handles: class filtering, no-repeat, shuffle.
   */
  fetchChallengeQuestions: async (level: number): Promise<Question[]> => {
    const response = await edudecaApi.getChallengeQuestions(level);
    const questions = response.questions || (response as any) || [];

    if (Array.isArray(questions)) {
      return questions.map(mapServerQuestion);
    }

    return [];
  },

  /**
   * Checks if the daily challenge is available for this student.
   */
  checkAvailability: async () => {
    return edudecaApi.getChallengeAvailability();
  },

  /**
   * Submits completed quiz attempt via the website API.
   * The server handles XP/RDM calculations and level progression.
   */
  submitQuizAttempt: async (
    payload: QuizSubmissionPayload,
    _userId?: string
  ): Promise<QuizSubmissionResponse> => {
    const totalQ = payload.total || payload.totalQuestions || 10;
    const result = await edudecaApi.completeChallenge({
      level: payload.level,
      score: payload.score,
      total: totalQ,
      timeTaken: payload.timeTaken,
    });

    const newLevel = result.new_level ?? payload.level;
    const attempt: IQuizAttempt = {
      id: result.attempt_id || String(Date.now()),
      userId: payload.userId || '',
      level: payload.level,
      score: payload.score,
      total: totalQ,
      totalQuestions: totalQ,
      accuracy: payload.accuracy || Math.round((payload.score / totalQ) * 100),
      timeTaken: payload.timeTaken,
      earnedRdm: result.xp_earned ?? (payload.earnedRdm || 0),
      passed: payload.passed ?? (payload.score >= totalQ * 0.7),
      completedAt: new Date().toISOString(),
    };

    return {
      success: result.success !== false,
      attempt,
      user: {} as any,
      leveledUp: result.leveled_up || false,
      newLevel,
    };
  },

  /**
   * Fetches past quiz attempts from edudeca_daily_attempts table.
   */
  fetchQuizHistory: async (
    level?: number,
    _userId?: string
  ): Promise<IQuizAttempt[]> => {
    let query = supabase
      .from('edudeca_daily_attempts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (level) {
      query = query.eq('level', level);
    }

    const { data, error } = await query;

    if (error) {
      console.log('[QuizService] History fetch notice:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      level: row.level,
      score: row.score,
      total: row.total || 10,
      totalQuestions: row.total || 10,
      accuracy: row.accuracy || Math.round((row.score / (row.total || 10)) * 100),
      timeTaken: row.time_taken || 0,
      earnedRdm: row.xp_earned || 0,
      passed: row.passed ?? (row.score / (row.total || 10)) >= 0.7,
      completedAt: row.completed_at || row.created_at,
    }));
  },

  /**
   * Get level trial/gate status from the website API.
   */
  getTrials: async () => {
    return edudecaApi.getTrials();
  },
};
