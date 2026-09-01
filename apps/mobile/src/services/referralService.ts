import { apiClient } from './apiClient';
import {
  IReferral,
  ReferralBatchPayload,
  ApiResponse,
} from '@edudeca/types';

export const referralService = {
  /**
   * Submits batch viral referrals to earn RDM coins
   */
  submitBatchReferrals: async (
    contacts: Array<{ name: string; phone?: string; email?: string }>,
    userId?: string
  ): Promise<{ insertedCount: number; rewardRdm: number; totalEarned: number }> => {
    const headers = userId ? { 'x-user-id': userId } : undefined;
    const response = await apiClient.post<
      ApiResponse<{ insertedCount: number; rewardRdm: number; totalEarned: number }>
    >('/referrals/batch', { contacts }, { headers });

    if (!response.data) {
      throw new Error(response.error || 'Failed to submit referrals');
    }

    return response.data;
  },

  /**
   * Fetches user's viral referral history and reward status
   */
  fetchMyReferrals: async (userId?: string): Promise<IReferral[]> => {
    const headers = userId ? { 'x-user-id': userId } : undefined;
    const response = await apiClient.get<ApiResponse<IReferral[]>>('/referrals/me', undefined, {
      headers,
    });

    return response.data || [];
  },
};
