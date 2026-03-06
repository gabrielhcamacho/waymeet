import { create } from 'zustand';
import { ActivityFeedItem, ActivityFeedType } from '../types';
import { generateId } from '../utils/helpers';

interface ActivityFeedStore {
    recentActivities: ActivityFeedItem[];

    /** Add a new activity to the feed (max 30 items) */
    addActivity: (
        type: ActivityFeedType,
        userId: string,
        userName: string,
        userAvatar: string,
        description: string,
        metadata?: ActivityFeedItem['metadata']
    ) => void;

    /** Set activities from API/mock */
    setActivities: (items: ActivityFeedItem[]) => void;

    /** Filter activities by community (via metadata) */
    getCommunityActivities: (communityId: string) => ActivityFeedItem[];
}

const MAX_FEED_ITEMS = 30;

export const useActivityFeedStore = create<ActivityFeedStore>((set, get) => ({
    recentActivities: [],

    addActivity: (type, userId, userName, userAvatar, description, metadata) => {
        const item: ActivityFeedItem = {
            id: generateId(),
            type,
            userId,
            userName,
            userAvatar,
            description,
            timestamp: new Date().toISOString(),
            metadata,
        };

        set((state) => ({
            recentActivities: [item, ...state.recentActivities].slice(0, MAX_FEED_ITEMS),
        }));
    },

    setActivities: (items) => {
        set({ recentActivities: items });
    },

    getCommunityActivities: (communityId) => {
        return get().recentActivities.filter(
            (a) => a.metadata?.communityId === communityId
        );
    },
}));
