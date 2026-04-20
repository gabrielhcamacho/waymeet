import { supabase } from '../config/supabase';
import { ActivityFeedItem } from '../types';
import { MOCK_ACTIVITY_FEED } from '../data/mockData';

export async function fetchRecentActivity(limit = 20): Promise<ActivityFeedItem[]> {
    try {
        const { data, error } = await supabase.rpc('get_recent_activity', {
            p_limit: limit,
        });

        if (error || !data || data.length === 0) return MOCK_ACTIVITY_FEED;

        return data.map((item: any) => ({
            id: item.id,
            type: item.type,
            userId: item.user_id,
            userName: item.user_name,
            userAvatar: item.user_avatar,
            description: item.description,
            timestamp: item.created_at,
            metadata: item.metadata || {},
        }));
    } catch {
        return MOCK_ACTIVITY_FEED;
    }
}

export async function insertActivityFeedItem(params: {
    userId: string;
    type: ActivityFeedItem['type'];
    description: string;
    metadata?: Record<string, any>;
}): Promise<void> {
    try {
        await supabase.from('activity_feed').insert({
            user_id: params.userId,
            type: params.type,
            description: params.description,
            metadata: params.metadata || {},
        });
    } catch {
        // silent fail
    }
}
