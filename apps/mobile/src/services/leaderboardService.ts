import { apiClient } from './apiClient';
import { LeaderboardEntry } from '@edudeca/types';

export const leaderboardService = {
  /**
   * Fetches real-time leaderboard rankings aggregated for a specific level
   */
  fetchLeaderboardByLevel: async (
    level: number,
    limit: number = 50,
    userId?: string
  ): Promise<LeaderboardEntry[]> => {
    const headers = userId ? { 'x-user-id': userId } : undefined;
    const response = await apiClient.get<{
      success: boolean;
      level: number;
      totalParticipants: number;
      data: LeaderboardEntry[];
    }>(`/leaderboards/${level}`, { limit }, { headers });

    return response.data || [];
  },

  /**
   * Fetches national / global leaderboard ranked by RDM balance & level
   */
  fetchGlobalLeaderboard: async (
    limit: number = 50,
    userId?: string
  ): Promise<LeaderboardEntry[]> => {
    const headers = userId ? { 'x-user-id': userId } : undefined;
    const response = await apiClient.get<{
      success: boolean;
      totalParticipants: number;
      data: LeaderboardEntry[];
    }>('/leaderboards/global/overall', { limit }, { headers });

    return response.data || [];
  },
};
