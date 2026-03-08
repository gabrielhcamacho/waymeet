export type UserMode = 'visitante' | 'morador';

export interface User {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string;
    coverPhotoUrl: string;
    homeCity: string;
    bio: string;
    selectedCategories: string[];
    followersCount: number;
    followingCount: number;
    createdAt: string;
    emailVerified: boolean;
    gdprConsent: boolean;
    // Social fields
    mode: UserMode;
    reputation: number;
    hostEventsCount: number;
    communities: string[];
    // Presence fields
    lastActive: string;
    currentLat?: number;
    currentLong?: number;
    // Business fields
    accountType?: 'personal' | 'business';
    businessCategory?: string;
    businessAddress?: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export interface SocialIntention {
    id: string;
    emoji: string;
    label: string;
    activeCount: number;
    matchedUsers?: PresenceUser[];
}

export interface MicroCommunity {
    id: string;
    name: string;
    emoji: string;
    memberCount: number;
    imageUrl: string;
    description: string;
}

export interface SocialRoute {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    placesCount: number;
    activeGroups: number;
    activeParticipants: number;
}

export interface HeatZone {
    id: string;
    name: string;
    intensity: number; // 0–1
    latitude: number;
    longitude: number;
    activityCount: number;
}

export interface WayMeetEvent {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    locationName: string;
    creatorId: string;
    creator: User;
    attendees: User[];
    maxParticipants: number;
    price: number;
    isPublic: boolean;
    createdAt: string;
    // Confirmation social
    interestedCount: number;
    confirmedCount: number;
    arrivedCount: number;
    isEphemeral: boolean;
    expiresAt?: string; // ISO string — TTL for ephemeral events
}

export interface NearbyActivity {
    id: string;
    emoji: string;
    label: string;
    peopleCount: number;
    distance: string;
    time: string;
    eventId?: string;       // Link to event for navigation
    locationName?: string;  // Where this is happening
}

// ── Real-time Presence ──

export interface PresenceUser {
    id: string;
    displayName: string;
    avatarUrl: string;
    latitude: number;
    longitude: number;
    intentionType?: string;
    intentionEmoji?: string;
    lastActive: string; // ISO string
    mode: UserMode;
}

// ── Activity Feed ──

export type ActivityFeedType =
    | 'event_created'
    | 'user_arrived'
    | 'route_started'
    | 'intention_set'
    | 'community_joined'
    | 'event_joined';

export interface ActivityFeedItem {
    id: string;
    type: ActivityFeedType;
    userId: string;
    userName: string;
    userAvatar: string;
    description: string;
    timestamp: string; // ISO string
    metadata?: {
        eventId?: string;
        communityId?: string;
        routeId?: string;
        locationName?: string;
    };
}

// ── Existing types (unchanged) ──

export interface Itinerary {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    rating: number;
    locations: string[];
    category: string;
    creator: User;
    createdAt: string;
    duration: string;
    price: number;
}

export interface Place {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    rating: number;
    address: string;
    city: string;
    category: string;
    categoryIcons: string[];
    latitude: number;
    longitude: number;
    website?: string;
    instagram?: string;
    phone?: string;
    menuUrl?: string;
    hours?: string;
    popularHours?: string;
    priceTier?: number;
    photos?: string[];
}

export interface ChatMessage {
    id: string;
    eventId: string;
    userId: string;
    user: User;
    text: string;
    timestamp: string;
    isSystem: boolean;
}

export interface FilterState {
    categories: string[];
    priceMin: number;
    priceMax: number;
    distanceMax: number;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export type ExploreTab = 'Tudo' | 'Recomendados' | 'Rotas de viagem' | 'Internacional' | 'Hoje';

export type MapLayer = 'eventos' | 'pessoas' | 'lugares' | 'rotas';
