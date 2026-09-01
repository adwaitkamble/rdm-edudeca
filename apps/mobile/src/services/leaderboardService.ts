import { apiClient } from './apiClient';
import { LeaderboardEntry, ApiResponse } from '@edudeca/types';

export const leaderboardService = {
  /**
   * Fetches real-time leaderboard rankings aggregated for a specific level
   */
  fetchLeaderboardByLevel: async (
    level: number,
    limit: number = 50
  ): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get<{
      success: boolean;
      level: number;
      totalParticipants: number;
      data: LeaderboardEntry[];
    }>(`/leaderboards/${level}`, { limit });

    return response.data || [];
  },
};
