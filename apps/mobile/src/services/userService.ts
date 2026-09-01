import { apiClient } from './apiClient';
import { UserProfile, ApiResponse } from '@edudeca/types';

export const userService = {
  /**
   * Fetches the authenticated user profile and stats from MongoDB
   */
  fetchCurrentUser: async (userId?: string): Promise<UserProfile> => {
    const headers = userId ? { 'x-user-id': userId } : undefined;
    const response = await apiClient.get<ApiResponse<UserProfile>>('/users/me', undefined, {
      headers,
    });

    if (!response.data) {
      throw new Error(response.error || 'Failed to load user profile');
    }

    return response.data;
  },

  /**
   * Updates user demographic & academic profile
   */
  updateUserProfile: async (
    profile: Partial<UserProfile>,
    userId?: string
  ): Promise<UserProfile> => {
    const headers = userId ? { 'x-user-id': userId } : undefined;
    const response = await apiClient.put<ApiResponse<UserProfile>>('/users/profile', profile, {
      headers,
    });

    if (!response.data) {
      throw new Error(response.error || 'Failed to update profile');
    }

    return response.data;
  },
};
