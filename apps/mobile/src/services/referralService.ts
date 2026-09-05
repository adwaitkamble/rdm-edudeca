import { apiClient } from './apiClient';
import {
  IReferral,
  ReferralBatchPayload,
  ApiResponse,
  CommunityRoom,
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

  /**
   * Fetches the current user's own community squad room
   */
  fetchMyRoom: async (userId?: string): Promise<CommunityRoom | null> => {
    const headers = userId ? { 'x-user-id': userId } : undefined;
    const response = await apiClient.get<ApiResponse<CommunityRoom>>('/referrals/my-room', undefined, {
      headers,
    });
    return response.data || null;
  },

  /**
   * Fetches any community squad room by referral code
   */
  fetchRoomByCode: async (code: string, userId?: string): Promise<CommunityRoom | null> => {
    const headers = userId ? { 'x-user-id': userId } : undefined;
    const response = await apiClient.get<ApiResponse<CommunityRoom>>(
      `/referrals/room/${encodeURIComponent(code)}`,
      undefined,
      { headers }
    );
    return response.data || null;
  },

  /**
   * Join a community squad room using a host's referral code
   */
  joinCommunityRoom: async (
    roomCode: string,
    userId?: string
  ): Promise<{ room: CommunityRoom; awardedRdm: number; message: string }> => {
    const headers = userId ? { 'x-user-id': userId } : undefined;
    const response = await apiClient.post<
      ApiResponse<CommunityRoom> & { awardedRdm?: number; message?: string }
    >('/referrals/join-room', { roomCode }, { headers });

    if (!response.data) {
      throw new Error(response.error || 'Failed to join squad room');
    }

    return {
      room: response.data,
      awardedRdm: (response as any).awardedRdm || 50,
      message: (response as any).message || 'Joined squad room!',
    };
  },

  /**
   * Fetches the squad room the current user has joined (if any)
   */
  fetchJoinedRoom: async (userId?: string): Promise<CommunityRoom | null> => {
    const headers = userId ? { 'x-user-id': userId } : undefined;
    const response = await apiClient.get<ApiResponse<CommunityRoom>>('/referrals/joined-room', undefined, {
      headers,
    });
    return response.data || null;
  },
};
