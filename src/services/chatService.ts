import { supabase } from '../config/supabase';
import { ChatMessage, User } from '../types';
import { MOCK_USERS } from '../data/mockData';

function mapRow(row: any): ChatMessage {
    const user: User = row.sender
        ? {
              id: row.sender.id,
              email: '',
              displayName: row.sender.display_name || 'Usuário',
              avatarUrl: row.sender.avatar_url || '',
              coverPhotoUrl: '',
              homeCity: '',
              bio: '',
              selectedCategories: [],
              followersCount: 0,
              followingCount: 0,
              createdAt: '',
              emailVerified: false,
              gdprConsent: false,
              mode: 'visitante',
              reputation: 0,
              hostEventsCount: 0,
              communities: [],
              lastActive: new Date().toISOString(),
          }
        : MOCK_USERS[0];

    return {
        id: row.id,
        eventId: row.event_id,
        userId: row.user_id,
        user,
        text: row.text,
        timestamp: row.created_at,
        isSystem: row.is_system || false,
    };
}

export async function fetchMessages(eventId: string, type: 'event' | 'community' = 'event'): Promise<ChatMessage[]> {
    try {
        const filter = type === 'community'
            ? { column: 'community_id', value: eventId }
            : { column: 'event_id', value: eventId };

        const { data, error } = await supabase
            .from('chat_messages')
            .select('*, sender:profiles!chat_messages_user_id_fkey(id, display_name, avatar_url)')
            .eq(filter.column, filter.value)
            .order('created_at', { ascending: true })
            .limit(100);

        if (error || !data) return [];
        return data.map(mapRow);
    } catch {
        return [];
    }
}

export async function sendMessage(
    eventId: string,
    userId: string,
    text: string,
    isSystem = false,
    type: 'event' | 'community' = 'event'
): Promise<ChatMessage | null> {
    try {
        const payload = type === 'community'
            ? { community_id: eventId, user_id: userId, text, is_system: isSystem }
            : { event_id: eventId, user_id: userId, text, is_system: isSystem };

        const { data, error } = await supabase
            .from('chat_messages')
            .insert(payload)
            .select('*, sender:profiles!chat_messages_user_id_fkey(id, display_name, avatar_url)')
            .single();

        if (error || !data) return null;
        return mapRow(data);
    } catch {
        return null;
    }
}

export function subscribeToMessages(
    eventId: string,
    onInsert: (msg: ChatMessage) => void,
    type: 'event' | 'community' = 'event'
): () => void {
    const filterColumn = type === 'community' ? 'community_id' : 'event_id';
    const channel = supabase
        .channel(`chat:${type}:${eventId}`)
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `${filterColumn}=eq.${eventId}` },
            (payload) => {
                if (payload.new) onInsert(mapRow(payload.new));
            }
        )
        .subscribe();

    return () => { supabase.removeChannel(channel); };
}
