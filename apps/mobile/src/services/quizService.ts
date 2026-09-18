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
import { QUESTION_BANK } from '../utils/mockData';

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
 * Robustly parses question text across different backend key conventions (question, question_text, prompt, q, etc.)
 */
const mapServerQuestion = (sq: ChallengeQuestion): Question => {
  const key = (sq.discipline || sq.tag || sq.subject || '').toLowerCase().trim();
  const mapping = DISCIPLINE_MAP[key] || { tag: 'PHYSICS', color: 'teal' };

  // Robust question text extraction
  let questionPrompt = '';
  if (typeof sq.question === 'string' && sq.question.trim().length > 0) {
    questionPrompt = sq.question.trim();
  } else if (typeof sq.question_text === 'string' && sq.question_text.trim().length > 0) {
    questionPrompt = sq.question_text.trim();
  } else if (typeof sq.questionText === 'string' && sq.questionText.trim().length > 0) {
    questionPrompt = sq.questionText.trim();
  } else if (typeof sq.prompt === 'string' && sq.prompt.trim().length > 0) {
    questionPrompt = sq.prompt.trim();
  } else if (typeof sq.text === 'string' && sq.text.trim().length > 0) {
    questionPrompt = sq.text.trim();
  } else if (typeof sq.q === 'string' && sq.q.trim().length > 0) {
    questionPrompt = sq.q.trim();
  } else if (typeof sq.title === 'string' && sq.title.trim().length > 0) {
    questionPrompt = sq.title.trim();
  } else if (typeof sq.statement === 'string' && sq.statement.trim().length > 0) {
    questionPrompt = sq.statement.trim();
  } else if (typeof sq.problem === 'string' && sq.problem.trim().length > 0) {
    questionPrompt = sq.problem.trim();
  } else if (typeof sq.content === 'string' && sq.content.trim().length > 0) {
    questionPrompt = sq.content.trim();
  } else if (sq.question && typeof sq.question === 'object') {
    questionPrompt =
      (sq.question as any).text ||
      (sq.question as any).prompt ||
      (sq.question as any).title ||
      (sq.question as any).q ||
      '';
  }

  // Robust options extraction
  let options: string[] = [];
  if (Array.isArray(sq.options)) {
    options = sq.options.map((opt: any) =>
      typeof opt === 'string'
        ? opt
        : opt?.text || opt?.option || opt?.value || opt?.title || String(opt)
    );
  } else if (Array.isArray(sq.o)) {
    options = sq.o.map((opt: any) =>
      typeof opt === 'string'
        ? opt
        : opt?.text || opt?.option || opt?.value || opt?.title || String(opt)
    );
  } else if (typeof sq.options === 'string') {
    try {
      const parsed = JSON.parse(sq.options);
      if (Array.isArray(parsed)) {
        options = parsed.map((opt: any) =>
          typeof opt === 'string'
            ? opt
            : opt?.text || opt?.option || opt?.value || opt?.title || String(opt)
        );
      }
    } catch {
      options = (sq.options as string).split(',').map((s: string) => s.trim());
    }
  } else if (sq.option_a || sq.option_b || sq.option_c || sq.option_d) {
    options = [sq.option_a, sq.option_b, sq.option_c, sq.option_d].filter(Boolean);
  } else if (sq.option1 || sq.option2 || sq.option3 || sq.option4) {
    options = [sq.option1, sq.option2, sq.option3, sq.option4].filter(Boolean);
  }

  // Robust correctIndex extraction
  let correctIndex = 0;
  if (typeof sq.correct_index === 'number') {
    correctIndex = sq.correct_index;
  } else if (typeof sq.correctIndex === 'number') {
    correctIndex = sq.correctIndex;
  } else if (typeof sq.c === 'number') {
    correctIndex = sq.c;
  } else if (typeof sq.answer === 'number') {
    correctIndex = sq.answer;
  } else if (typeof sq.correct_answer === 'number') {
    correctIndex = sq.correct_answer;
  } else if (typeof sq.correct_option === 'string') {
    const letterMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
    const optLower = sq.correct_option.toLowerCase().trim();
    if (letterMap[optLower] !== undefined) {
      correctIndex = letterMap[optLower];
    } else {
      const idx = options.indexOf(sq.correct_option);
      if (idx !== -1) correctIndex = idx;
    }
  } else if (typeof sq.correct_answer === 'string') {
    const letterMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
    const optLower = sq.correct_answer.toLowerCase().trim();
    if (letterMap[optLower] !== undefined) {
      correctIndex = letterMap[optLower];
    } else {
      const idx = options.indexOf(sq.correct_answer);
      if (idx !== -1) correctIndex = idx;
    }
  }

  return {
    tag: (sq.tag as DisciplineTag) || mapping.tag,
    color: (sq.color as AccentColorKey) || mapping.color,
    q: questionPrompt,
    options,
    correctIndex,
  };
};

export const quizService = {
  /**
   * Fetches challenge questions for the current level:
   * Strictly loads from GET /api/challenge/questions?level={level}
   * Do not invent a local question picker. Do not touch mock tables.
   */
  fetchChallengeQuestions: async (level: number): Promise<Question[]> => {
    const response = await edudecaApi.getChallengeQuestions(level);
    const questions =
      response?.questions ||
      (response as any)?.data ||
      (response as any)?.results ||
      (Array.isArray(response) ? response : []);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No questions returned from live EduDeca API for this level.');
    }
    console.log('[QuizService] Loaded raw questions count:', questions.length, 'Sample raw item:', questions[0]);
    return questions.map(mapServerQuestion);
  },

  /**
   * Checks if the daily challenge is available for this student.
   */
  checkAvailability: async () => {
    try {
      return await edudecaApi.getChallengeAvailability();
    } catch (_err) {
      return { available: true };
    }
  },

  /**
   * Submits completed quiz attempt strictly via POST /api/challenge/complete
   */
  submitQuizAttempt: async (
    payload: QuizSubmissionPayload,
    _userId?: string
  ): Promise<QuizSubmissionResponse> => {
    const totalQ = payload.total || payload.totalQuestions || 10;
    const strikes = payload.strikes ?? Math.max(0, totalQ - payload.score);
    const passed = payload.passed ?? (strikes < 3);

    // Live website API challenge complete call
    const result = await edudecaApi.completeChallenge({
      level: payload.level,
      score: payload.score,
      total: totalQ,
      strikes,
      passed,
      timeTaken: payload.timeTaken,
    });

    const newLevel = result?.new_level ?? (passed ? payload.level + 1 : payload.level);
    const attempt: IQuizAttempt = {
      id: result?.attempt_id || String(Date.now()),
      userId: payload.userId || '',
      level: payload.level,
      score: payload.score,
      total: totalQ,
      totalQuestions: totalQ,
      accuracy: payload.accuracy || Math.round((payload.score / totalQ) * 100),
      timeTaken: payload.timeTaken,
      earnedRdm: result?.xp_earned ?? (payload.earnedRdm || 0),
      passed,
      completedAt: new Date().toISOString(),
    };

    return {
      success: true,
      attempt,
      user: {} as any,
      leveledUp: result?.leveled_up ?? (passed && payload.level >= 1),
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
