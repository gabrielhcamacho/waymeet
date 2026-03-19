import { create } from 'zustand';

export type FriendRequestStatus = 'none' | 'pending' | 'accepted' | 'rejected';

interface FriendsState {
    // Map of userId to FriendRequestStatus (from the perspective of the current logged-in user)
    // For example, if current user sent a request to user 'A', statuses['A'] = 'pending'
    // If user 'A' is a friend, statuses['A'] = 'accepted'
    statuses: Record<string, FriendRequestStatus>;
    friendsCount: number;

    // Actions
    getFriendStatus: (userId: string) => FriendRequestStatus;
    sendFriendRequest: (userId: string) => Promise<void>;
    acceptFriendRequest: (userId: string) => Promise<void>;
    removeFriendOrRequest: (userId: string) => Promise<void>;
}

export const useFriendsStore = create<FriendsState>((set, get) => ({
    statuses: {
        // Mock data: User '2' is a friend, User '3' has a pending request
        '2': 'accepted',
        '3': 'pending',
    },
    friendsCount: 1,

    getFriendStatus: (userId: string) => {
        return get().statuses[userId] || 'none';
    },

    sendFriendRequest: async (userId: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        set((state) => ({
            statuses: {
                ...state.statuses,
                [userId]: 'pending'
            }
        }));
    },

    acceptFriendRequest: async (userId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        set((state) => ({
            statuses: {
                ...state.statuses,
                [userId]: 'accepted'
            },
            friendsCount: state.friendsCount + 1,
        }));
    },

    removeFriendOrRequest: async (userId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        set((state) => {
            const newStatuses = { ...state.statuses };
            const wasFriend = newStatuses[userId] === 'accepted';
            delete newStatuses[userId];
            
            return {
                statuses: newStatuses,
                friendsCount: wasFriend ? Math.max(0, state.friendsCount - 1) : state.friendsCount
            };
        });
    },
}));
