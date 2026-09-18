/**
 * EduDeca Website API Client
 *
 * Calls the EduDeca website REST APIs at www.edudeca.com/api/*
 * All requests include the Supabase access_token as Bearer auth.
 */
import { supabase } from '../lib/supabase';

const EDUDECA_API_BASE =
  process.env.EXPO_PUBLIC_EDUDECA_API_URL || 'https://www.edudeca.com/api';

interface EdudecaApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
}

async function edudecaFetch<T>(endpoint: string, options: EdudecaApiOptions = {}): Promise<T> {
  const { method = 'GET', body, params } = options;

  // Get the current Supabase access token
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  let url = `${EDUDECA_API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Append query params
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err: any) {
    // If www.edudeca.com fails with SSL/Network error, attempt fallback to apex domain
    if (url.includes('www.edudeca.com')) {
      const fallbackUrl = url.replace('www.edudeca.com', 'edudeca.com');
      try {
        response = await fetch(fallbackUrl, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
      } catch {
        throw new Error(err.message || 'Unable to connect to live EduDeca API server.');
      }
    } else {
      throw new Error(err.message || 'Unable to connect to live EduDeca API server.');
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errMsg = data?.error || data?.message || `API Error ${response.status}`;
    throw new Error(errMsg);
  }

  return data as T;
}

// ─── Challenge / Daily Quiz APIs ───────────────────────────────────

export interface ChallengeAvailability {
  available: boolean;
  reason?: string;
  class_level?: number;
  [key: string]: any;
}

export interface ChallengeQuestion {
  id?: string;
  question?: string;
  question_text?: string;
  questionText?: string;
  prompt?: string;
  text?: string;
  q?: string;
  title?: string;
  options?: string[];
  o?: string[];
  correct_index?: number;
  correctIndex?: number;
  c?: number;
  answer?: number;
  correct_answer?: any;
  correct_option?: string;
  discipline?: string;
  class?: string;
  [key: string]: any;
}

export interface ChallengeCompletePayload {
  level: number;
  score: number;
  total: number;
  strikes: number;
  passed: boolean;
  timeTaken: number;
  answers?: Record<string, number>;
  [key: string]: any;
}

export interface ChallengeCompleteResponse {
  success: boolean;
  xp_earned?: number;
  new_level?: number;
  leveled_up?: boolean;
  unlocked_at?: string;
  [key: string]: any;
}

export interface ProgressResponse {
  campaign_level: number;
  class_level?: number;
  xp: number;
  streak: number;
  selected_track?: string;
  disciplines?: string[] | Record<string, any>;
  last_challenge_date?: string;
  unlocked_at?: string;
  [key: string]: any;
}

export interface PatchProgressPayload {
  track?: 'A' | 'B' | 'math' | 'bio' | string;
  disciplines?: string[];
  class_level?: number;
  [key: string]: any;
}

export interface TrialResponse {
  trials_remaining?: number;
  gate_level?: number;
  [key: string]: any;
}

export interface MockAttempt {
  id: string;
  score: number;
  total: number;
  completed_at: string;
  [key: string]: any;
}

// ─── Exported API Functions ────────────────────────────────────────

export const edudecaApi = {
  /**
   * GET /api/progress — Student's current progress (level, XP, streak, lineup)
   */
  getProgress: () =>
    edudecaFetch<ProgressResponse>('/progress'),

  /**
   * PATCH /api/progress — Update student lineup or class_level
   */
  patchProgress: (payload: PatchProgressPayload) =>
    edudecaFetch<ProgressResponse>('/progress', {
      method: 'PATCH',
      body: payload,
    }),

  /**
   * GET /api/challenge/availability — Is the daily challenge available?
   */
  getChallengeAvailability: () =>
    edudecaFetch<ChallengeAvailability>('/challenge/availability'),

  /**
   * GET /api/challenge/questions?level=N — Load questions for the level
   */
  getChallengeQuestions: (level: number) =>
    edudecaFetch<{ questions: ChallengeQuestion[] }>('/challenge/questions', {
      params: { level },
    }),

  /**
   * POST /api/challenge/complete — Submit challenge results (strikes, passed, timeTaken)
   */
  completeChallenge: (payload: ChallengeCompletePayload) =>
    edudecaFetch<ChallengeCompleteResponse>('/challenge/complete', {
      method: 'POST',
      body: payload,
    }),

  /**
   * GET /api/challenge/trials — Level gate / trial status
   */
  getTrials: () =>
    edudecaFetch<TrialResponse>('/challenge/trials'),

  /**
   * GET /api/mock-attempts — Past mock exam results
   */
  getMockAttempts: () =>
    edudecaFetch<{ attempts: MockAttempt[] }>('/mock-attempts'),
};
