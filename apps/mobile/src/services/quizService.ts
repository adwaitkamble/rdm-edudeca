import { apiClient } from './apiClient';
import {
  QuizSubmissionPayload,
  QuizSubmissionResponse,
  IQuizAttempt,
  ApiResponse,
} from '@edudeca/types';

export const quizService = {
  /**
   * Submits completed quiz attempt to MongoDB and syncs user level & RDM balance
   */
  submitQuizAttempt: async (
    payload: QuizSubmissionPayload,
    userId?: string
  ): Promise<QuizSubmissionResponse> => {
    const headers = userId ? { 'x-user-id': userId } : undefined;
    const response = await apiClient.post<QuizSubmissionResponse>(
      '/quizzes/submit',
      { ...payload, userId: payload.userId || userId },
      { headers }
    );

    return response;
  },

  /**
   * Fetches past quiz attempts for the authenticated user
   */
  fetchQuizHistory: async (
    level?: number,
    userId?: string
  ): Promise<IQuizAttempt[]> => {
    const headers = userId ? { 'x-user-id': userId } : undefined;
    const response = await apiClient.get<ApiResponse<IQuizAttempt[]>>(
      '/quizzes/history',
      { level },
      { headers }
    );

    return response.data || [];
  },
};
