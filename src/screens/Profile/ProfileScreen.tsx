import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { EventCard } from '../../components/EventCard';
import { useUserStore } from '../../store/useUserStore';
import { useEventsStore } from '../../store/useEventsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, logout } = useUserStore();
    const { events } = useEventsStore();
    const [activeTab, setActiveTab] = useState<'posts' | 'routes'>('posts');

    const userEvents = events.filter((e) => e.creatorId === user?.id || e.creatorId === '1');

    return (
        <View className="flex-1 bg-background">
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
                        className="w-[90px] h-[90px] rounded-full border-4 border-background mb-3 overflow-hidden"
                        style={Shadows.medium}
                    >
                        <ImageBackground
                            source={{ uri: user?.avatarUrl || 'https://via.placeholder.com/100' }}
                            className="w-full h-full bg-borderLight"
                            imageStyle={{ borderRadius: 45 }}
                        />
                    </View>
                    <Text className="text-2xl font-bold text-text">{user?.displayName || 'User'}</Text>
                    <View className="flex-row items-center gap-1 mt-1">
                        <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                        <Text className="text-[13px] text-textSecondary">
                            {user?.homeCity || 'Cidade não definida'}
                        </Text>
                    </View>
                    {user?.bio ? (
                        <Text className="text-[13px] text-textSecondary text-center mt-2 leading-5">
                            {user.bio}
                        </Text>
                    ) : null}

                    {/* Stats */}
                    <View className="flex-row items-center mt-5 gap-6 bg-surface py-4 px-8 rounded-2xl">
                        <View className="items-center">
                            <Text className="text-lg font-bold text-text">{user?.followersCount || 0}</Text>
                            <Text className="text-[11px] text-textSecondary mt-0.5">Seguidores</Text>
                        </View>
                        <View className="w-px h-[30px] bg-border" />
                        <View className="items-center">
                            <Text className="text-lg font-bold text-text">{user?.followingCount || 0}</Text>
                            <Text className="text-[11px] text-textSecondary mt-0.5">Seguindo</Text>
                        </View>
                        <View className="w-px h-[30px] bg-border" />
                        <View className="items-center">
                            <Text className="text-lg font-bold text-text">{userEvents.length}</Text>
                            <Text className="text-[11px] text-textSecondary mt-0.5">Eventos</Text>
                        </View>
                    </View>
                </View>

                {/* Tabs */}
                <View className="flex-row border-b border-borderLight mt-5 mx-5">
                    <TouchableOpacity
                        className={`flex-1 items-center py-3 ${activeTab === 'posts' ? 'border-b-2 border-primary' : ''}`}
                        onPress={() => setActiveTab('posts')}
                    >
                        <Text className={`text-sm font-medium ${activeTab === 'posts' ? 'text-primary font-bold' : 'text-textMuted'}`}>
                            Posts
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 items-center py-3 ${activeTab === 'routes' ? 'border-b-2 border-primary' : ''}`}
                        onPress={() => setActiveTab('routes')}
                    >
                        <Text className={`text-sm font-medium ${activeTab === 'routes' ? 'text-primary font-bold' : 'text-textMuted'}`}>
                            Rotas
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View className="p-5">
                    {userEvents.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onPress={() => navigation.navigate('EventDetail', { event })}
                        />
                    ))}
                    {userEvents.length === 0 && (
                        <View className="items-center py-10 gap-3">
                            <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
                            <Text className="text-sm text-textMuted">Nenhum evento ainda</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};