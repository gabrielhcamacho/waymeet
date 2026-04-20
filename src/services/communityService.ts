import { supabase } from '../config/supabase';
import { MicroCommunity } from '../types';
import { MOCK_COMMUNITIES } from '../data/mockData';

export async function fetchCommunities(): Promise<MicroCommunity[]> {
    try {
        const { data, error } = await supabase
            .from('communities')
            .select(`
                *,
                community_member_counts (member_count)
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error || !data || data.length === 0) return MOCK_COMMUNITIES;

        return data.map((c: any) => ({
            id: c.id,
            name: c.name,
            emoji: '👥',
            memberCount: (c as any).community_member_counts?.member_count ?? 0,
            imageUrl:
                c.image_url ||
                'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400',
            description: c.description || '',
        }));
    } catch {
        return MOCK_COMMUNITIES;
    }
}

export async function joinCommunity(communityId: string, userId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('community_members')
            .upsert(
                { community_id: communityId, user_id: userId, role: 'member' },
                { onConflict: 'community_id,user_id' }
            );
        return !error;
    } catch {
        return false;
    }
}

export async function fetchUserMemberships(userId: string): Promise<string[]> {
    try {
        const { data, error } = await supabase
            .from('community_members')
            .select('community_id')
            .eq('user_id', userId);

        if (error || !data) return [];
        return data.map((row: any) => row.community_id as string);
    } catch {
        return [];
    }
}
