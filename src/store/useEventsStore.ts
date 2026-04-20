import { create } from 'zustand';
import { WayMeetEvent, FilterState } from '../types';
import { MOCK_EVENTS } from '../data/mockData';
import { generateId } from '../utils/helpers';
import { MOCK_USERS } from '../data/mockData';
import * as eventsService from '../services/eventsService';

export type EventUserStatus = 'none' | 'interested' | 'confirmed' | 'arrived';

interface EventsStore {
    events: WayMeetEvent[];
    filters: FilterState;
    isLoading: boolean;
    /** Maps eventId → user's current status */
    userEventStatus: Record<string, EventUserStatus>;

    // Actions
    fetchEvents: () => Promise<void>;
    createEvent: (event: Omit<WayMeetEvent, 'id' | 'createdAt' | 'creator' | 'attendees' | 'interestedCount' | 'confirmedCount' | 'arrivedCount' | 'isEphemeral'> & { isEphemeral?: boolean }) => void;
    joinEvent: (eventId: string, userId: string) => void;
    leaveEvent: (eventId: string, userId: string) => void;
    setFilters: (filters: Partial<FilterState>) => void;
    resetFilters: () => void;
    getFilteredEvents: () => WayMeetEvent[];

    // Confirmation flow
    markInterested: (eventId: string) => void;
    markConfirmed: (eventId: string) => void;
    markArrived: (eventId: string) => void;
    resetEventStatus: (eventId: string) => void;
}

const DEFAULT_FILTERS: FilterState = {
    categories: [],
    priceMin: 0,
    priceMax: 10000,
    distanceMax: 100,
};

export const useEventsStore = create<EventsStore>((set, get) => ({
    events: [],
    filters: { ...DEFAULT_FILTERS },
    isLoading: false,
    userEventStatus: {},

    fetchEvents: async () => {
        set({ isLoading: true });
        const data = await eventsService.fetchEvents();
        set({ events: data, isLoading: false });
    },

    createEvent: (eventData) => {
        const newEvent: WayMeetEvent = {
            ...eventData,
            id: generateId(),
            createdAt: new Date().toISOString(),
            creator: MOCK_USERS[0],
            attendees: [MOCK_USERS[0]],
            interestedCount: 1,
            confirmedCount: 1,
            arrivedCount: 0,
            isEphemeral: eventData.isEphemeral || false,
        };
        set((state) => ({
            events: [newEvent, ...state.events],
            userEventStatus: { ...state.userEventStatus, [newEvent.id]: 'confirmed' },
        }));
    },

    joinEvent: (eventId: string, _userId: string) => {
        set((state) => ({
            events: state.events.map((event) =>
                event.id === eventId
                    ? { ...event, attendees: [...event.attendees, MOCK_USERS[0]] }
                    : event
            ),
        }));
    },

    leaveEvent: (eventId: string, userId: string) => {
        set((state) => ({
            events: state.events.map((event) =>
                event.id === eventId
                    ? { ...event, attendees: event.attendees.filter((a) => a.id !== userId) }
                    : event
            ),
        }));
    },

    // Confirmation flow actions
    markInterested: (eventId) => {
        set((state) => ({
            userEventStatus: { ...state.userEventStatus, [eventId]: 'interested' },
            events: state.events.map((e) =>
                e.id === eventId
                    ? { ...e, interestedCount: e.interestedCount + 1 }
                    : e
            ),
        }));
    },

    markConfirmed: (eventId) => {
        set((state) => {
            const wasInterested = state.userEventStatus[eventId] === 'interested';
            return {
                userEventStatus: { ...state.userEventStatus, [eventId]: 'confirmed' },
                events: state.events.map((e) =>
                    e.id === eventId
                        ? {
                            ...e,
                            confirmedCount: e.confirmedCount + 1,
                            interestedCount: wasInterested ? e.interestedCount - 1 : e.interestedCount,
                            attendees: [...e.attendees, MOCK_USERS[0]],
                        }
                        : e
                ),
            };
        });
    },

    markArrived: (eventId) => {
        set((state) => ({
            userEventStatus: { ...state.userEventStatus, [eventId]: 'arrived' },
            events: state.events.map((e) =>
                e.id === eventId
                    ? {
                        ...e,
                        arrivedCount: e.arrivedCount + 1,
                        confirmedCount: e.confirmedCount > 0 ? e.confirmedCount - 1 : 0,
                    }
                    : e
            ),
        }));
    },

    resetEventStatus: (eventId) => {
        set((state) => {
            const prev = state.userEventStatus[eventId];
            const newStatus = { ...state.userEventStatus };
            delete newStatus[eventId];
            return {
                userEventStatus: newStatus,
                events: state.events.map((e) => {
                    if (e.id !== eventId) return e;
                    const updates: Partial<WayMeetEvent> = {};
                    if (prev === 'interested') updates.interestedCount = e.interestedCount - 1;
                    if (prev === 'confirmed') {
                        updates.confirmedCount = e.confirmedCount - 1;
                        updates.attendees = e.attendees.filter((a) => a.id !== MOCK_USERS[0].id);
                    }
                    if (prev === 'arrived') updates.arrivedCount = e.arrivedCount - 1;
                    return { ...e, ...updates };
                }),
            };
        });
    },

    setFilters: (updates: Partial<FilterState>) => {
        set((state) => ({ filters: { ...state.filters, ...updates } }));
    },

    resetFilters: () => {
        set({ filters: { ...DEFAULT_FILTERS } });
    },

    getFilteredEvents: () => {
        const { events, filters } = get();
        return events.filter((event) => {
            if (filters.categories.length > 0 && !filters.categories.includes(event.category)) {
                return false;
            }
            if (event.price < filters.priceMin || event.price > filters.priceMax) {
                return false;
            }
            return true;
        });
    },
}));
