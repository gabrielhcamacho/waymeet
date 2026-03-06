import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { SectionHeader } from '../../components/SectionHeader';
import { IntentionBadge } from '../../components/IntentionBadge';
import { SocialHeatIndicator } from '../../components/SocialHeatIndicator';
import { CommunityCard } from '../../components/CommunityCard';
import { EventCard } from '../../components/EventCard';
import { ActivityFeedCard } from '../../components/ActivityFeedCard';
import { IntentionSelectorSheet } from '../../components/IntentionSelectorSheet';
import { useEventsStore } from '../../store/useEventsStore';
import { useIntentionStore } from '../../store/useIntentionStore';
import { usePresenceStore } from '../../store/usePresenceStore';
import { useActivityFeedStore } from '../../store/useActivityFeedStore';
import {
    MOCK_INTENTIONS,
    MOCK_COMMUNITIES,
    MOCK_HEAT_ZONES,
    MOCK_ACTIVITY_FEED,
    MOCK_PRESENCE_USERS,
} from '../../data/mockData';

export const RadarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { events } = useEventsStore();
    const { activeIntention } = useIntentionStore();
    const { setActiveUsers, getActiveNearby } = usePresenceStore();
    const { recentActivities, setActivities } = useActivityFeedStore();
    const [refreshing, setRefreshing] = useState(false);
    const [showIntentionSheet, setShowIntentionSheet] = useState(false);

    // Initialize mock data
    useEffect(() => {
        setActiveUsers(MOCK_PRESENCE_USERS);
        setActivities(MOCK_ACTIVITY_FEED);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const upcomingEvents = [...events].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    ).slice(0, 4);

    // Intention matching: find nearby users with same intention
    const intentionMatches = activeIntention
        ? MOCK_PRESENCE_USERS.filter(
            (u) => u.intentionType === activeIntention.label.split(' ')[0]?.toLowerCase()
        )
        : [];

    // Find how many want "café" nearby (most common)
    const cafeMatches = MOCK_PRESENCE_USERS.filter((u) => u.intentionType === 'cafe');

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#222"
                    />
                }
            >
                {/* Intention Banner */}
                <View className="px-5 pt-3 pb-1">
                    {activeIntention ? (
                        <TouchableOpacity
                            onPress={() => setShowIntentionSheet(true)}
                            activeOpacity={0.8}
                            className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3.5"
                        >
                            <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-3 border border-gray-100">
                                <Text className="text-xl">{activeIntention.emoji}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] font-bold text-gray-900">
                                    Você quer {activeIntention.label}
                                </Text>
                                <Text className="text-[11px] text-gray-400 mt-0.5">
                                    Expira em 2h · Toque para mudar
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() => setShowIntentionSheet(true)}
                            activeOpacity={0.8}
                            className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-dashed border-gray-200"
                        >
                            <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-3 border border-gray-100">
                                <Ionicons name="add" size={20} color="#9CA3AF" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] font-semibold text-gray-700">
                                    O que você quer fazer agora?
                                </Text>
                                <Text className="text-[11px] text-gray-400 mt-0.5">
                                    Defina sua intenção e encontre pessoas
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Intention Matching Suggestion */}
                {cafeMatches.length >= 2 && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        className="mx-5 mt-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex-row items-center"
                    >
                        <View className="w-9 h-9 bg-emerald-100 rounded-xl items-center justify-center mr-3">
                            <Text className="text-base">☕</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-[13px] font-bold text-emerald-800">
                                {cafeMatches.length} pessoas querem café perto de você
                            </Text>
                            <Text className="text-[11px] text-emerald-600 mt-0.5">
                                Toque para criar um encontro
                            </Text>
                        </View>
                        <View className="bg-emerald-600 rounded-full px-3 py-1.5">
                            <Text className="text-[11px] font-bold text-white">Criar</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Divider */}
                <View className="h-px bg-gray-100 mx-5 mt-4 mb-2" />

                {/* Activity Feed — "Acontecendo agora" */}
                <View className="mb-3">
                    <SectionHeader title="Acontecendo agora" />
                    {recentActivities.slice(0, 5).map((item) => (
                        <ActivityFeedCard
                            key={item.id}
                            item={item}
                            onPress={() => {
                                if (item.metadata?.eventId) {
                                    const event = events.find((e) => e.id === item.metadata?.eventId);
                                    if (event) navigation.navigate('EventDetail', { event });
                                }
                            }}
                        />
                    ))}
                </View>

                {/* Divider */}
                <View className="h-2 bg-gray-50 mb-4" />

                {/* Active Intentions */}
                <View className="mb-5">
                    <SectionHeader title="Intenções ativas" />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                        {MOCK_INTENTIONS.map((intention) => (
                            <IntentionBadge
                                key={intention.id}
                                intention={intention}
                                onPress={() => setShowIntentionSheet(true)}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Social Heat Map */}
                <View className="mb-5">
                    <SectionHeader title="Pulso da cidade" />
                    <View className="px-5">
                        {MOCK_HEAT_ZONES.map((zone) => (
                            <SocialHeatIndicator key={zone.id} zone={zone} />
                        ))}
                    </View>
                </View>

                {/* Divider */}
                <View className="h-2 bg-gray-50 mb-4" />

                {/* Events Starting */}
                <View className="mb-5">
                    <SectionHeader
                        title="Próximos encontros"
                        onSeeMore={() => { }}
                    />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                        {upcomingEvents.map((event) => (
                            <View key={event.id} className="w-[280px] mr-4">
                                <EventCard
                                    event={event}
                                    onPress={() => navigation.navigate('EventDetail', { event })}
                                />
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Divider */}
                <View className="h-2 bg-gray-50 mb-4" />

                {/* Micro Communities */}
                <View className="mb-8">
                    <SectionHeader
                        title="Comunidades"
                        onSeeMore={() => { }}
                    />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                        {MOCK_COMMUNITIES.map((community) => (
                            <CommunityCard
                                key={community.id}
                                community={community}
                                onPress={() => navigation.navigate('CommunityDetail', { community })}
                            />
                        ))}
                    </ScrollView>
                </View>

                <View className="h-5" />
            </ScrollView>

            {/* Intention Selector Sheet */}
            <IntentionSelectorSheet
                visible={showIntentionSheet}
                onClose={() => setShowIntentionSheet(false)}
            />
        </View>
    );
};
