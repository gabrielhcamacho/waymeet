import { supabase } from '../config/supabase';
import { WayMeetEvent, User } from '../types';
import { MOCK_EVENTS, MOCK_USERS } from '../data/mockData';

const PLACEHOLDER_IMAGE =
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop';

function mapEventRow(e: any): WayMeetEvent {
    const creator: User = e.creator
        ? {
              id: e.creator.id,
              email: '',
              displayName: e.creator.display_name || 'Usuário',
              avatarUrl: e.creator.avatar_url || '',
              coverPhotoUrl: '',
              homeCity: '',
              bio: '',
              selectedCategories: [],
              followersCount: 0,
              followingCount: 0,
              createdAt: '',
              emailVerified: false,
              gdprConsent: false,
              mode: e.creator.mode || 'visitante',
              reputation: 0,
              hostEventsCount: 0,
              communities: [],
              lastActive: new Date().toISOString(),
          }
        : MOCK_USERS[0];

    const participants: any[] = e.event_participants || [];
    return {
        id: e.id,
        title: e.title,
        description: e.description || '',
        imageUrl: e.image_url || PLACEHOLDER_IMAGE,
        category: e.category,
        date: e.date,
        time: e.start_time || '18:00',
        latitude: e.latitude,
        longitude: e.longitude,
        locationName: e.location_name || '',
        creatorId: e.creator_id,
        creator,
        attendees: [],
        maxParticipants: e.max_participants || 20,
        price: e.price || 0,
        isPublic: e.is_public !== false,
        createdAt: e.created_at,
        interestedCount: participants.filter((p) => p.status === 'interested').length,
        confirmedCount: participants.filter((p) => p.status === 'confirmed').length,
        arrivedCount: participants.filter((p) => p.status === 'arrived').length,
        isEphemeral: e.is_ephemeral || false,
        expiresAt: e.expires_at,
    };
}

export async function fetchEvents(): Promise<WayMeetEvent[]> {
    try {
        const { data, error } = await supabase
            .from('events')
            .select(
                `*, creator:profiles!events_creator_id_fkey(id, display_name, avatar_url, mode), event_participants(user_id, status)`
            )
            .eq('is_public', true)
            .order('date', { ascending: true })
            .limit(30);

        if (error || !data || data.length === 0) return MOCK_EVENTS;
        return data.map(mapEventRow);
    } catch {
        return MOCK_EVENTS;
    }
}

export async function fetchEventById(id: string): Promise<WayMeetEvent | null> {
    try {
        const { data, error } = await supabase
            .from('events')
            .select(
                `*, creator:profiles!events_creator_id_fkey(id, display_name, avatar_url, mode), event_participants(user_id, status)`
            )
            .eq('id', id)
            .single();

        if (error || !data) return null;
        return mapEventRow(data);
    } catch {
        return null;
    }
}

export async function createEvent(
    eventData: Omit<
        WayMeetEvent,
        'id' | 'createdAt' | 'creator' | 'attendees' | 'interestedCount' | 'confirmedCount' | 'arrivedCount'
    >
): Promise<WayMeetEvent | null> {
    try {
        const { data, error } = await supabase
            .from('events')
            .insert({
                title: eventData.title,
                description: eventData.description,
                image_url: eventData.imageUrl,
                category: eventData.category,
                date: eventData.date,
                start_time: eventData.time,
                latitude: eventData.latitude,
                longitude: eventData.longitude,
                location_name: eventData.locationName,
                creator_id: eventData.creatorId,
                max_participants: eventData.maxParticipants,
                price: eventData.price,
                is_public: eventData.isPublic,
                is_ephemeral: eventData.isEphemeral,
                expires_at: eventData.expiresAt,
            })
            .select()
            .single();

        if (error || !data) return null;
        return mapEventRow(data);
    } catch {
        return null;
    }
}

export async function joinEvent(
    eventId: string,
    userId: string,
    status: 'interested' | 'confirmed' | 'arrived' = 'interested'
): Promise<void> {
    try {
        await supabase
            .from('event_participants')
            .upsert({ event_id: eventId, user_id: userId, status }, { onConflict: 'event_id,user_id' });
    } catch {
        // silent fail
    }
}
