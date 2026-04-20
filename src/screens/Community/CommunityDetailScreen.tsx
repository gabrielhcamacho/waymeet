import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Users, Calendar } from 'lucide-react-native';
import { Text } from '@/src/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SectionHeader } from '../../components/SectionHeader';
import { EventCard } from '../../components/EventCard';
import { ActivityFeedCard } from '../../components/ActivityFeedCard';
import { useEventsStore } from '../../store/useEventsStore';
import { usePresenceStore } from '../../store/usePresenceStore';
import { useActivityFeedStore } from '../../store/useActivityFeedStore';
import { MOCK_ACTIVITY_FEED, MOCK_USERS } from '../../data/mockData';
import { useCommunityStore } from '../../store/useCommunityStore';
import { useUserStore } from '../../store/useUserStore';

export const CommunityDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const { community } = route.params;
    const { events } = useEventsStore();
    const { recentActivities, setActivities } = useActivityFeedStore();
    const { activeUsers } = usePresenceStore();
    const { joinCommunity, joinedCommunityIds, fetchUserMemberships, communities } = useCommunityStore();
    const { user } = useUserStore();

    // Get live member count from store (updated after join)
    const liveCommunity = communities.find(c => c.id === community.id);
    const memberCount = liveCommunity?.memberCount ?? community.memberCount;
    const joined = joinedCommunityIds.includes(community.id);

    useEffect(() => {
        if (recentActivities.length === 0) setActivities(MOCK_ACTIVITY_FEED);
    }, []);

    useEffect(() => {
        if (user?.id) {
            fetchUserMemberships(user.id);
        }
    }, [user?.id]);

    // Simulate community events
    const communityEvents = events.slice(0, 3);

    // Community activity feed (filter by communityId metadata)
    const communityFeed = recentActivities.filter(
        (a) => a.metadata?.communityId === community.id
    );
    // Fallback: show recent general feed if no community-specific items
    const feedToShow = communityFeed.length > 0 ? communityFeed : recentActivities.slice(0, 3);

    // Online members (mock: count active users from presence)
    const onlineCount = Math.min(activeUsers.filter((u) => {
        const ago = Date.now() - new Date(u.lastActive).getTime();
        return ago < 10 * 60 * 1000;
    }).length, community.memberCount);

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <ImageBackground
                    source={{ uri: community.imageUrl }}
                    className="w-full h-[220px] justify-end"
                >
                    <View className="bg-black/40 px-5 pb-5 pt-12">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Users size={20} color="white" strokeWidth={2} />
                            <Text className="text-white text-2xl font-bold">{community.name}</Text>
                        </View>
                        <Text className="text-white/80 text-sm mt-1">
                            {community.description}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="absolute left-5 bg-white/90 w-10 h-10 rounded-full items-center justify-center"
                        style={{ top: insets.top + 4 }}
                    >
                        <Ionicons name="arrow-back" size={20} color="#1F2937" />
                    </TouchableOpacity>
                </ImageBackground>

                {/* Stats + Online + Join */}
                <View className="px-5 py-4 flex-row items-center justify-between border-b border-gray-100">
                    <View className="flex-row items-center gap-4">
                        <View className="items-center">
                            <Text className="text-lg font-bold text-gray-900">{memberCount}</Text>
                            <Text className="text-[11px] text-gray-400">membros</Text>
                        </View>
                        <View className="w-px h-8 bg-gray-200" />
                        <View className="items-center">
                            <View className="flex-row items-center gap-1">
                                <View className="w-2 h-2 rounded-full bg-green-500" />
                                <Text className="text-lg font-bold text-gray-900">{onlineCount}</Text>
                            </View>
                            <Text className="text-[11px] text-gray-400">online</Text>
                        </View>
                        <View className="w-px h-8 bg-gray-200" />
                        <View className="items-center">
                            <Text className="text-lg font-bold text-gray-900">{communityEvents.length}</Text>
                            <Text className="text-[11px] text-gray-400">encontros</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={async () => {
                            if (!user?.id) return;
                            if (!joined) {
                                await joinCommunity(community.id, user.id);
                            }
                            // If already joined, no leave action needed for now
                        }}
                        activeOpacity={0.8}
                        className={`px-6 py-2.5 rounded-full ${joined ? 'bg-gray-100' : 'bg-gray-900'
                            }`}
                    >
                        <Text className={`text-sm font-bold ${joined ? 'text-gray-600' : 'text-white'}`}>
                            {joined ? 'Participando' : 'Entrar'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Community Chat Button (Visible only when joined) */}
                {joined && (
                    <View className="px-5 py-3 border-b border-gray-100">
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Chat', { eventId: community.id, eventTitle: community.name, chatType: 'community' })}
                            activeOpacity={0.8}
                            className="bg-orange-500 rounded-xl py-3.5 flex-row items-center justify-center gap-2"
                        >
                            <Ionicons name="chatbubbles" size={20} color="white" />
                            <Text className="text-[15px] font-bold text-white">
                                Acessar Chat da Comunidade
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Recent Activity Feed */}
                <View className="pt-2 pb-2 border-b border-gray-100">
                    <SectionHeader title="Atividade recente" />
                    {feedToShow.map((item) => (
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
                    {feedToShow.length === 0 && (
                        <View className="items-center py-6">
                            <Text className="text-sm text-gray-400">Nenhuma atividade recente</Text>
                        </View>
                    )}
                </View>

                {/* Members Preview */}
                <View className="px-5 py-4 border-b border-gray-100">
                    <Text className="text-sm font-bold text-gray-900 mb-3">Membros ativos</Text>
                    <View className="flex-row gap-3">
                        {MOCK_USERS.slice(0, 5).map((userMock, i) => (
                            <View
                                key={i}
                                className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center overflow-hidden"
                            >
                                <Image source={{ uri: userMock.avatarUrl }} className="w-full h-full" />
                            </View>
                        ))}
                        <View className="w-11 h-11 rounded-full bg-gray-50 items-center justify-center">
                            <Text className="text-[11px] text-gray-400 font-bold">+{community.memberCount - 5}</Text>
                        </View>
                    </View>
                </View>

                {/* Community Events */}
                <View className="mt-2 mb-8">
                    <SectionHeader title="Encontros da comunidade" />
                    {communityEvents.map((event) => (
                        <View key={event.id} className="px-5">
                            <EventCard
                                event={event}
                                onPress={() => navigation.navigate('EventDetail', { event })}
                            />
                        </View>
                    ))}
                    {communityEvents.length === 0 && (
                        <View className="items-center py-10">
                            <View className="w-14 h-14 bg-gray-100 rounded-2xl items-center justify-center mb-3">
                                <Calendar size={24} color="#9CA3AF" strokeWidth={1.5} />
                            </View>
                            <Text className="text-sm text-gray-400">Nenhum encontro ainda</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};
