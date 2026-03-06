import { create } from 'zustand';
import { PresenceUser } from '../types';

interface PresenceStore {
    activeUsers: PresenceUser[];
    lastHeartbeat: string | null;

    /** Update current user's presence */
    heartbeat: (lat: number, lng: number, intentionType?: string, intentionEmoji?: string) => void;

    /** Get active users within a radius (km) */
    getActiveNearby: (lat: number, lng: number, radiusKm: number) => PresenceUser[];

    /** Check if a specific user was active in last N minutes */
    isUserActive: (userId: string, minutes?: number) => boolean;

    /** Set the full list of active users (from API/mock) */
    setActiveUsers: (users: PresenceUser[]) => void;

    /** Get count of active users from a list of user IDs */
    getOnlineCount: (userIds: string[]) => number;
}

const ACTIVE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

/** Haversine distance in km */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const usePresenceStore = create<PresenceStore>((set, get) => ({
    activeUsers: [],
    lastHeartbeat: null,

    heartbeat: (lat, lng, intentionType, intentionEmoji) => {
        const now = new Date().toISOString();
        set({ lastHeartbeat: now });
        // In production: POST to Supabase user_presence table
        // For now we just track the timestamp
    },

    getActiveNearby: (lat, lng, radiusKm) => {
        const { activeUsers } = get();
        const cutoff = Date.now() - ACTIVE_THRESHOLD_MS;

        return activeUsers.filter((user) => {
            const isRecent = new Date(user.lastActive).getTime() > cutoff;
            if (!isRecent) return false;
            const dist = haversineKm(lat, lng, user.latitude, user.longitude);
            return dist <= radiusKm;
        });
    },

    isUserActive: (userId, minutes = 10) => {
        const { activeUsers } = get();
        const cutoff = Date.now() - minutes * 60 * 1000;
        const user = activeUsers.find((u) => u.id === userId);
        return !!user && new Date(user.lastActive).getTime() > cutoff;
    },

    setActiveUsers: (users) => {
        set({ activeUsers: users });
    },

    getOnlineCount: (userIds) => {
        const { activeUsers } = get();
        const cutoff = Date.now() - ACTIVE_THRESHOLD_MS;
        return activeUsers.filter(
            (u) => userIds.includes(u.id) && new Date(u.lastActive).getTime() > cutoff
        ).length;
    },
}));
