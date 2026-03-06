import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { EventCard } from '../../components/EventCard';
import { HostBadge } from '../../components/HostBadge';
import { CommunityTag } from '../../components/CommunityTag';
import { SectionHeader } from '../../components/SectionHeader';
import { useUserStore } from '../../store/useUserStore';
import { useEventsStore } from '../../store/useEventsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_COMMUNITIES } from '../../data/mockData';

const INTEREST_EMOJIS: Record<string, string> = {
    '1': '👨‍👩‍👧‍👦', '2': '💑', '3': '👫', '4': '🏔️', '5': '🏛️',
    '6': '🎭', '7': '🌾', '8': '☀️', '9': '⚽', '10': '🎵',
    '11': '🌿', '12': '🍽️', '13': '🎉', '14': '💼',
};

const INTEREST_NAMES: Record<string, string> = {
    '1': 'Family', '2': 'Romance', '3': 'Friends', '4': 'Aventura', '5': 'Histórico',
    '6': 'Cultural', '7': 'Rural', '8': 'Verão', '9': 'Esportes', '10': 'Música',
    '11': 'Ecotour', '12': 'Gastronomia', '13': 'Encontros', '14': 'Business',
};

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, logout } = useUserStore();
    const { events } = useEventsStore();
    const [activeTab, setActiveTab] = useState<'eventos' | 'sobre'>('eventos');

    const userEvents = events.filter((e) => e.creatorId === user?.id || e.creatorId === '1');
    const userCommunities = MOCK_COMMUNITIES.filter((c) =>
        user?.communities?.includes(c.id) || true // show all for mock
    ).slice(0, 4);

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Cover */}
                <ImageBackground
                    source={{ uri: user?.coverPhotoUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop' }}
                    className="h-[200px] w-full"
                >
                    <View className="flex-1 bg-black/15 p-4" style={{ paddingTop: insets.top }}>
                        <View className="flex-row justify-between">
                            <View />
                            <View className="flex-row gap-2">
                                <TouchableOpacity
                                    className="w-[38px] h-[38px] rounded-full bg-white/90 justify-center items-center"
                                    onPress={() => navigation.navigate('EditProfile')}
                                >
                                    <Ionicons name="create-outline" size={20} color={Colors.text} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="w-[38px] h-[38px] rounded-full bg-white/90 justify-center items-center"
                                    onPress={logout}
                                >
                                    <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ImageBackground>

                {/* Avatar & Info */}
                <View className="items-center px-5 -mt-[45px]">
                    <View
                        className="w-[90px] h-[90px] rounded-full border-4 border-white mb-3 overflow-hidden"
                        style={Shadows.medium}
                    >
                        <ImageBackground
                            source={{ uri: user?.avatarUrl || 'https://via.placeholder.com/100' }}
                            className="w-full h-full bg-gray-100"
                            imageStyle={{ borderRadius: 45 }}
                        />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">{user?.displayName || 'User'}</Text>

                    {/* Mode & Reputation */}
                    <View className="flex-row items-center gap-3 mt-2">
                        <View className="bg-gray-100 rounded-full px-3 py-1">
                            <Text className="text-[12px] font-semibold text-gray-500">
                                {user?.mode === 'morador' ? '🏠 morador' : '✈️ visitante'}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text className="text-[13px] font-bold text-amber-600">
                                {user?.reputation?.toFixed(1) || '0.0'}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-1 mt-2">
                        <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                        <Text className="text-[13px] text-gray-400">
                            {user?.homeCity || 'Cidade não definida'}
                        </Text>
                    </View>
                    {user?.bio ? (
                        <Text className="text-[13px] text-gray-400 text-center mt-2 leading-5">
                            {user.bio}
                        </Text>
                    ) : null}

                    {/* Stats */}
                    <View className="flex-row items-center mt-5 gap-6 bg-gray-50 py-4 px-8 rounded-2xl">
                        <View className="items-center">
                            <Text className="text-lg font-bold text-gray-900">{user?.followersCount || 0}</Text>
                            <Text className="text-[11px] text-gray-400 mt-0.5">Seguidores</Text>
                        </View>
                        <View className="w-px h-[30px] bg-gray-200" />
                        <View className="items-center">
                            <Text className="text-lg font-bold text-gray-900">{user?.followingCount || 0}</Text>
                            <Text className="text-[11px] text-gray-400 mt-0.5">Seguindo</Text>
                        </View>
                        <View className="w-px h-[30px] bg-gray-200" />
                        <View className="items-center">
                            <Text className="text-lg font-bold text-gray-900">{userEvents.length}</Text>
                            <Text className="text-[11px] text-gray-400 mt-0.5">Encontros</Text>
                        </View>
                    </View>
                </View>

                {/* Host Badge */}
                {(user?.hostEventsCount || 0) > 0 && (
                    <View className="px-5 mt-5">
                        <HostBadge eventsCount={user?.hostEventsCount || 0} />
                    </View>
                )}

                {/* Interests */}
                <View className="mt-6">
                    <SectionHeader title="Interesses" />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                        {(user?.selectedCategories || []).map((catId) => (
                            <View
                                key={catId}
                                className="flex-row items-center bg-orange-50 border border-orange-200 rounded-full px-4 py-2 mr-2"
                            >
                                <Text className="text-sm mr-1">{INTEREST_EMOJIS[catId] || '📍'}</Text>
                                <Text className="text-[13px] font-medium text-orange-700">
                                    {INTEREST_NAMES[catId] || catId}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Communities */}
                <View className="mt-6">
                    <SectionHeader title="Micro comunidades" />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                        {userCommunities.map((community) => (
                            <CommunityTag key={community.id} community={community} />
                        ))}
                    </ScrollView>
                </View>

                {/* Tabs */}
                <View className="flex-row border-b border-gray-100 mt-6 mx-5">
                    <TouchableOpacity
                        className={`flex-1 items-center py-3 ${activeTab === 'eventos' ? 'border-b-2 border-orange-500' : ''}`}
                        onPress={() => setActiveTab('eventos')}
                    >
                        <Text className={`text-sm font-medium ${activeTab === 'eventos' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                            Encontros
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 items-center py-3 ${activeTab === 'sobre' ? 'border-b-2 border-orange-500' : ''}`}
                        onPress={() => setActiveTab('sobre')}
                    >
                        <Text className={`text-sm font-medium ${activeTab === 'sobre' ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                            Sobre
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View className="p-5">
                    {activeTab === 'eventos' && (
                        <>
                            {userEvents.map((event) => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onPress={() => navigation.navigate('EventDetail', { event })}
                                />
                            ))}
                            {userEvents.length === 0 && (
                                <View className="items-center py-10 gap-3">
                                    <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                                    <Text className="text-sm text-gray-400">Nenhum encontro ainda</Text>
                                </View>
                            )}
                        </>
                    )}
                    {activeTab === 'sobre' && (
                        <View className="gap-4">
                            <View>
                                <Text className="text-sm font-semibold text-gray-500 mb-1">Bio</Text>
                                <Text className="text-[15px] text-gray-700 leading-6">{user?.bio || 'Nenhuma bio definida'}</Text>
                            </View>
                            <View>
                                <Text className="text-sm font-semibold text-gray-500 mb-1">Cidade</Text>
                                <Text className="text-[15px] text-gray-700">{user?.homeCity || 'Não definida'}</Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};