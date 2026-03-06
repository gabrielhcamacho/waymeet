import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { SectionHeader } from '../../components/SectionHeader';
import { NearbyActivityCard } from '../../components/NearbyActivityCard';
import { EventCard } from '../../components/EventCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEventsStore } from '../../store/useEventsStore';
import { MOCK_NEARBY_ACTIVITIES } from '../../data/mockData';

const FILTER_OPTIONS = [
    { id: 'all', emoji: '✨', label: 'Tudo' },
    { id: 'cafe', emoji: '☕', label: 'Café' },
    { id: 'drinks', emoji: '🍻', label: 'Drinks' },
    { id: 'esporte', emoji: '⚽', label: 'Esporte' },
    { id: 'explorar', emoji: '🚶', label: 'Explorar' },
    { id: 'musica', emoji: '🎵', label: 'Música' },
];

const FILTER_MAP: Record<string, string[]> = {
    cafe: ['Café'],
    drinks: ['Drinks'],
    esporte: ['Esporte', 'Futebol', 'Yoga'],
    explorar: ['Caminhada', 'Explorar'],
    musica: ['Música'],
};

export const AgoraScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [activeFilter, setActiveFilter] = useState('all');
    const { events } = useEventsStore();

    // Filter nearby activities by category
    const filteredActivities = activeFilter === 'all'
        ? MOCK_NEARBY_ACTIVITIES
        : MOCK_NEARBY_ACTIVITIES.filter((a) =>
            FILTER_MAP[activeFilter]?.some((f) =>
                a.label.toLowerCase().includes(f.toLowerCase())
            )
        );

    // Show ephemeral events that haven't expired
    const now = new Date();
    const ephemeralEvents = events.filter((e) => {
        if (!e.isEphemeral) return false;
        if (e.expiresAt && new Date(e.expiresAt).getTime() < now.getTime()) return false;
        return true;
    });

    // Show events starting in next 2h
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const soonEvents = events
        .filter((e) => {
            const eventDate = new Date(`${e.date}T${e.time}`);
            return eventDate >= now && eventDate <= twoHoursFromNow;
        })
        .slice(0, 3);

    // Helper: calculate remaining time for ephemeral
    const getTimeLeft = (expiresAt?: string): string | null => {
        if (!expiresAt) return null;
        const diff = new Date(expiresAt).getTime() - Date.now();
        if (diff <= 0) return null;
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}min restantes`;
        return `${Math.floor(mins / 60)}h${mins % 60}min restantes`;
    };

    // Handle NearbyActivity card press
    const handleActivityPress = (activity: typeof MOCK_NEARBY_ACTIVITIES[0]) => {
        if (activity.eventId) {
            const event = events.find((e) => e.id === activity.eventId);
            if (event) {
                navigation.navigate('EventDetail', { event });
                return;
            }
        }
        // No eventId → open ActivityDetail
        navigation.navigate('ActivityDetail', { activity });
    };

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-5 pt-4 pb-2">
                    <Text className="text-2xl font-bold text-gray-900">Agora</Text>
                    <Text className="text-[14px] text-gray-400 mt-1">
                        Atividades acontecendo perto de você
                    </Text>
                </View>

                {/* Category Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}
                >
                    {FILTER_OPTIONS.map((filter) => {
                        const isActive = activeFilter === filter.id;
                        return (
                            <TouchableOpacity
                                key={filter.id}
                                onPress={() => setActiveFilter(filter.id)}
                                activeOpacity={0.7}
                                className={`flex-row items-center px-4 py-2.5 rounded-full border ${isActive
                                    ? 'bg-gray-900 border-gray-900'
                                    : 'bg-white border-gray-200'
                                    }`}
                                style={{
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: isActive ? 0.15 : 0.05,
                                    shadowRadius: 4,
                                    elevation: isActive ? 3 : 1,
                                }}
                            >
                                <Text className="text-sm mr-1.5">{filter.emoji}</Text>
                                <Text
                                    className={`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-gray-700'
                                        }`}
                                >
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Nearby Activities — now with navigation */}
                <View className="mt-2">
                    <SectionHeader title="Perto de você" />
                    {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity) => (
                            <NearbyActivityCard
                                key={activity.id}
                                activity={activity}
                                onPress={() => handleActivityPress(activity)}
                            />
                        ))
                    ) : (
                        <View className="items-center py-8">
                            <Text className="text-3xl mb-2">🔍</Text>
                            <Text className="text-sm text-gray-400 font-medium">
                                Nenhuma atividade nessa categoria agora
                            </Text>
                        </View>
                    )}
                </View>

                {/* Ephemeral Events — with TTL countdown */}
                {ephemeralEvents.length > 0 && (
                    <View className="mt-4">
                        <SectionHeader title="⚡ Atividades efêmeras" />
                        {ephemeralEvents.map((event) => (
                            <View key={event.id} className="px-5">
                                <EventCard
                                    event={event}
                                    onPress={() => navigation.navigate('EventDetail', { event })}
                                />
                                {event.expiresAt && (
                                    <View className="flex-row items-center mt-1 mb-2 px-1">
                                        <Ionicons name="timer-outline" size={12} color="#F59E0B" />
                                        <Text className="text-[11px] text-yellow-600 font-medium ml-1">
                                            {getTimeLeft(event.expiresAt) || 'Expirado'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Starting Soon */}
                {soonEvents.length > 0 && (
                    <View className="mt-4">
                        <SectionHeader title="Começando em breve" />
                        {soonEvents.map((event) => (
                            <View key={event.id} className="px-5">
                                <EventCard
                                    event={event}
                                    onPress={() => navigation.navigate('EventDetail', { event })}
                                />
                            </View>
                        ))}
                    </View>
                )}

                <View className="h-[120px]" />
            </ScrollView>

            {/* Magic Button */}
            <View
                className="absolute bottom-0 left-0 right-0 px-5 pt-3 bg-gray-50"
                style={{ paddingBottom: insets.bottom + 12 }}
            >
                <TouchableOpacity
                    onPress={() => navigation.navigate('QuickCreate')}
                    activeOpacity={0.85}
                    className="bg-gray-900 rounded-2xl py-4 flex-row items-center justify-center gap-2"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                >
                    <Ionicons name="flash" size={22} color="white" />
                    <Text className="text-base font-bold text-white">
                        Alguém quer fazer algo?
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
