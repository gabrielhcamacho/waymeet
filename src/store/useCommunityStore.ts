import { create } from 'zustand';
import { MicroCommunity } from '../types';
import { MOCK_COMMUNITIES } from '../data/mockData';
import * as communityService from '../services/communityService';
import { fetchCommunities } from '../services/communityService';

interface CommunityStore {
    communities: MicroCommunity[];
    isLoading: boolean;
    joinedCommunityIds: string[];
    fetchCommunities: () => Promise<void>;
    joinCommunity: (communityId: string, userId: string) => Promise<void>;
    fetchUserMemberships: (userId: string) => Promise<void>;
}

export const useCommunityStore = create<CommunityStore>((set) => ({
    communities: [],
    isLoading: false,
    joinedCommunityIds: [],

    fetchCommunities: async () => {
        set({ isLoading: true });
        const data = await fetchCommunities();
        set({ communities: data.length > 0 ? data : MOCK_COMMUNITIES, isLoading: false });
    },

    fetchUserMemberships: async (userId: string) => {
        const ids = await communityService.fetchUserMemberships(userId);
        set((state) => ({
            joinedCommunityIds: [...new Set([...state.joinedCommunityIds, ...ids])],
        }));
    },

    joinCommunity: async (communityId: string, userId: string) => {
        // Optimistic update
        set((state) => ({
            joinedCommunityIds: [...new Set([...state.joinedCommunityIds, communityId])],
            communities: state.communities.map(c =>
                c.id === communityId
                    ? { ...c, memberCount: c.memberCount + 1 }
                    : c
            ),
        }));

        const success = await communityService.joinCommunity(communityId, userId);
        if (!success) {
            // Revert optimistic update on failure
            set((state) => ({
                joinedCommunityIds: state.joinedCommunityIds.filter(id => id !== communityId),
                communities: state.communities.map(c =>
                    c.id === communityId
                        ? { ...c, memberCount: Math.max(0, c.memberCount - 1) }
                        : c
                ),
            }));
        }
    },
}));
