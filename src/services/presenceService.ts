import { supabase } from '../config/supabase';
import { PresenceUser } from '../types';
import { MOCK_PRESENCE_USERS } from '../data/mockData';

export async function updatePresence(
    userId: string,
    latitude: number,
    longitude: number,
    intentionType?: string
): Promise<void> {
    try {
        await supabase.from('user_presence').upsert(
            {
                user_id: userId,
                latitude,
                longitude,
                intention_type: intentionType || null,
            },
            { onConflict: 'user_id' }
        );
    } catch {
        // silent fail
    }
}

export async function fetchNearbyUsers(
    latitude: number,
    longitude: number,
    radiusKm = 5
): Promise<PresenceUser[]> {
    try {
        const { data, error } = await supabase.rpc('get_nearby_active_users', {
            p_latitude: latitude,
            p_longitude: longitude,
            p_radius_km: radiusKm,
            p_minutes: 10,
        });

        if (error || !data || data.length === 0) return MOCK_PRESENCE_USERS;

        return data.map((u: any) => ({
            id: u.user_id,
            displayName: u.display_name,
            avatarUrl: u.avatar_url || '',
            latitude: u.latitude,
            longitude: u.longitude,
            intentionType: u.intention_type,
            intentionEmoji: '',
            lastActive: u.last_active,
            mode: u.mode,
        }));
    } catch {
        return MOCK_PRESENCE_USERS;
    }
}

export async function fetchIntentionMatches(
    latitude: number,
    longitude: number,
    intentionType: string,
    radiusKm = 3
): Promise<{ count: number; users: PresenceUser[] }> {
    try {
        const { data, error } = await supabase.rpc('get_intention_matches', {
            p_latitude: latitude,
            p_longitude: longitude,
            p_intention: intentionType,
            p_radius_km: radiusKm,
        });

        if (error || !data || data.length === 0) return { count: 0, users: [] };

        const row = data[0];
        return {
            count: Number(row.matched_count) || 0,
            users: (row.users || []).map((u: any) => ({
                id: u.userId,
                displayName: u.displayName,
                avatarUrl: u.avatarUrl || '',
                latitude,
                longitude,
                lastActive: new Date().toISOString(),
                mode: 'visitante' as const,
            })),
        };
    } catch {
        return { count: 0, users: [] };
    }
}
