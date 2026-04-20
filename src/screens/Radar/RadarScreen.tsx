import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Coffee } from 'lucide-react-native';
import { Text } from '@/src/components/ui/text';
import { SectionHeader } from '../../components/SectionHeader';
import { SocialHeatIndicator } from '../../components/SocialHeatIndicator';
import { CommunityCard } from '../../components/CommunityCard';
import { EventCard } from '../../components/EventCard';
import { ActivityFeedCard } from '../../components/ActivityFeedCard';
import { IntentionSelectorSheet } from '../../components/IntentionSelectorSheet';
import { useEventsStore } from '../../store/useEventsStore';
import { useIntentionStore } from '../../store/useIntentionStore';
import { usePresenceStore } from '../../store/usePresenceStore';
import { useActivityFeedStore } from '../../store/useActivityFeedStore';
import { useCommunityStore } from '../../store/useCommunityStore';
import { useCategoriesStore } from '../../store/useCategoriesStore';
import {
    MOCK_HEAT_ZONES,
    MOCK_ACTIVITY_FEED,
    MOCK_PRESENCE_USERS,
    MOCK_COMMUNITIES,
} from '../../data/mockData';

export const RadarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { events, fetchEvents, isLoading } = useEventsStore();
    const { activeIntention } = useIntentionStore();
    const { setActiveUsers } = usePresenceStore();
    const { recentActivities, setActivities, fetchActivities } = useActivityFeedStore();
    const { communities, fetchCommunities } = useCommunityStore();
    const { fetchCategories } = useCategoriesStore();
    const [refreshing, setRefreshing] = useState(false);
    const [showIntentionSheet, setShowIntentionSheet] = useState(false);

    useEffect(() => {
        fetchEvents();
        fetchCommunities();
        fetchCategories();
        setActiveUsers(MOCK_PRESENCE_USERS);
        if (fetchActivities) fetchActivities();
        else setActivities(MOCK_ACTIVITY_FEED);
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        Promise.allSettled([fetchEvents(), fetchCommunities()])
            .finally(() => setRefreshing(false));
    }, []);

    const upcomingEvents = (() => {
        const sorted = [...events].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        if (!activeIntention) return sorted;
        const label = activeIntention.label.toLowerCase();
        const matched = sorted.filter(e => e.category.toLowerCase().includes(label));
        const rest = sorted.filter(e => !e.category.toLowerCase().includes(label));
        return [...matched, ...rest];
    })();

    const cafeMatches = MOCK_PRESENCE_USERS.filter((u) => u.intentionType === 'cafe');

    const displayCommunities = (() => {
        const base = communities.length > 0 ? communities : MOCK_COMMUNITIES;
        if (!activeIntention) return base;
        const label = activeIntention.label.toLowerCase();
        const matched = base.filter(c =>
            c.name.toLowerCase().includes(label) ||
            c.description.toLowerCase().includes(label)
        );
        const rest = base.filter(c =>
            !c.name.toLowerCase().includes(label) &&
            !c.description.toLowerCase().includes(label)
        );
        return [...matched, ...rest];
    })();
    const displayActivities = recentActivities.length > 0 ? recentActivities : MOCK_ACTIVITY_FEED;

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
                {/* ── O que fazer agora ── */}
                <TouchableOpacity
                    onPress={() => setShowIntentionSheet(true)}
                    activeOpacity={0.8}
                    className="px-5 pt-4 pb-3 flex-row items-center justify-between"
                >
                    <Text className="text-[18px] font-bold text-gray-900">O que fazer agora?</Text>
                    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                </TouchableOpacity>

                {/* ── Intenção ativa (banner pessoal) ── */}
                <View className="px-5 pb-1">
                    {activeIntention ? (
                        <TouchableOpacity
                            onPress={() => setShowIntentionSheet(true)}
                            activeOpacity={0.8}
                            className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3.5"
                        >
                            <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-3 border border-gray-100">
                                <Coffee size={18} color="#6B7280" strokeWidth={2} />
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
                                    Defina sua intenção e encontre pessoas
                                </Text>
                                <Text className="text-[11px] text-gray-400 mt-0.5">
                                    Toque para começar
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Café match suggestion */}
                {cafeMatches.length >= 2 && (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        className="mx-5 mt-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex-row items-center"
                    >
                        <View className="w-9 h-9 bg-emerald-100 rounded-xl items-center justify-center mr-3">
                            <Coffee size={16} color="#059669" strokeWidth={2} />
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

                <View className="h-px bg-gray-100 mx-5 mt-4 mb-2" />

                {/* ── Acontecendo agora ── */}
                <View className="mb-3">
                    <SectionHeader title="Acontecendo agora" />
                    {displayActivities.slice(0, 5).map((item) => (
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

                <View className="h-2 bg-gray-50 mb-4" />

                {/* ── Pulso da cidade ── */}
                <View className="mb-5">
                    <SectionHeader title="Pulso da cidade" />
                    <View className="px-5">
                        {MOCK_HEAT_ZONES.map((zone) => (
                            <SocialHeatIndicator key={zone.id} zone={zone} />
                        ))}
                    </View>
                </View>

                <View className="h-2 bg-gray-50 mb-4" />

                {/* ── Próximos encontros ── */}
                <View className="mb-5">
                    <SectionHeader
                        title="Próximos encontros"
                        onSeeMore={() => navigation.navigate('AllEvents')}
                    />
                    {isLoading && upcomingEvents.length === 0 ? (
                        <View className="items-center py-8">
                            <Text className="text-[13px] text-gray-400">Carregando encontros...</Text>
                        </View>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20 }}
                        >
                            {upcomingEvents.slice(0, 5).map((event) => (
                                <View key={event.id} className="w-[280px] mr-4">
                                    <EventCard
                                        event={event}
                                        onPress={() => navigation.navigate('EventDetail', { event })}
                                    />
                                </View>
                            ))}
                            {upcomingEvents.length === 0 && (
                                <View className="items-center py-8 w-full">
                                    <Text className="text-[13px] text-gray-400">Nenhum encontro próximo</Text>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>

                <View className="h-2 bg-gray-50 mb-4" />

                {/* ── Comunidades ── */}
                <View className="mb-8">
                    <SectionHeader
                        title="Comunidades"
                        onSeeMore={() => navigation.navigate('AllCommunities')}
                    />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                        {displayCommunities.map((community) => (
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

            <IntentionSelectorSheet
                visible={showIntentionSheet}
                onClose={() => setShowIntentionSheet(false)}
            />
        </View>
    );
};
