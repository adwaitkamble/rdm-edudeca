export type TrackType = 'A' | 'B' | null;

export type DisciplineTag =
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'MATHS'
  | 'APPLIED MATH'
  | 'VERBAL'
  | 'QUANTITATIVE'
  | 'ANALYTICAL'
  | 'GK'
  | 'FINLIT'
  | 'ENTREPRENEURSHIP'
  | 'BIOLOGY'
  | 'BIOTECHNOLOGY';

export type AccentColorKey =
  | 'teal'
  | 'amber'
  | 'purple'
  | 'blue'
  | 'pink'
  | 'gold'
  | 'red';

export interface Discipline {
  id: string;
  name: string;
  tag: string;
  color: AccentColorKey;
  isLocked?: boolean;
  track?: 'A' | 'B';
  level?: number;
}

export interface Question {
  tag: DisciplineTag;
  color: AccentColorKey;
  q: string;
  options: string[];
  correctIndex: number;
}

export interface RawQuestion {
  tag: DisciplineTag;
  color: AccentColorKey;
  q: string;
  o: string[];
  c: number;
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  score: number;
  pickedIndex: number | null;
  timeLeft: number;
  isActive: boolean;
  isFinished: boolean;
  roundLength: 10 | 20 | 30;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  classGrade: string;
  scienceStream: boolean;
  institution: string;
  state: string;
  city: string;
  level4Consent: boolean;
  selectedTrack: TrackType;
  level: number;
  streak: number;
  rdmBalance: number;
  quizzesCompleted: number;
  referralCode?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface LeaderboardEntry {
  rank?: number;
  userId?: string;
  name: string;
  score: string;
  time: string;
  rawScore?: number;
  rawTime?: number;
  color: string;
  institution?: string;
}

export interface LevelNode {
  n: number;
  title: string;
  sub: string;
  tier: 'free' | 'paid' | 'finals';
}

export interface ReferredContact {
  id: string;
  name: string;
  initial: string;
  color: string;
  phone?: string;
  email?: string;
  status?: 'pending' | 'signed_up' | 'rewarded';
  joinedAt?: string;
}

// Backend API & MongoDB Shared Interfaces (Phase 7)

export interface IQuizAttempt {
  id?: string;
  userId: string;
  level: number;
  score: number;
  total?: number;
  totalQuestions: number;
  accuracy: number;
  timeTaken: number;
  earnedRdm: number;
  passed: boolean;
  disciplineBreakdown?: Array<{
    tag: string;
    correct: number;
    total: number;
  }>;
  completedAt: Date | string;
}

export interface QuizSubmissionPayload {
  userId?: string;
  level: number;
  score: number;
  total?: number;
  totalQuestions?: number;
  accuracy?: number;
  timeTaken: number;
  earnedRdm?: number;
  passed?: boolean;
  disciplineBreakdown?: Array<{
    tag: string;
    correct: number;
    total: number;
  }>;
}

export interface QuizSubmissionResponse {
  success: boolean;
  attempt: IQuizAttempt;
  user: UserProfile;
  leveledUp: boolean;
  newLevel: number;
}

export interface IReferral {
  id?: string;
  inviterId: string;
  name: string;
  phone?: string;
  email?: string;
  invitedContact?: string;
  status: 'pending' | 'joined' | 'signed_up' | 'rewarded';
  rewardPaid: boolean;
  rewardRdm: number;
  invitedAt: Date | string;
  joinedAt?: Date | string;
}

export interface ReferralBatchPayload {
  inviterId?: string;
  contacts: Array<{
    name: string;
    phone?: string;
    email?: string;
  }>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
