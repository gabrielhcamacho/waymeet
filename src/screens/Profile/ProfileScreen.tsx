import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ImageBackground, Modal, Animated, Dimensions } from 'react-native';
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
import { MOCK_COMMUNITIES, CATEGORIES } from '../../data/mockData';
import { Input, InputField } from '@/src/components/ui/input';

const { width, height } = Dimensions.get('window');

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
    const { user, logout, updateProfile } = useUserStore();
    const { events } = useEventsStore();
    const [activeTab, setActiveTab] = useState<'eventos' | 'sobre'>('eventos');

    // Drawer state
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [slideAnim] = useState(new Animated.Value(width));

    // Business form state
    const [businessState, setBusinessState] = useState({
        accountType: user?.accountType || 'personal',
        category: user?.businessCategory || '',
        address: user?.businessAddress || '',
    });

    const openMenu = () => {
        setIsMenuVisible(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    const closeMenu = () => {
        Animated.timing(slideAnim, {
            toValue: width,
            duration: 250,
            useNativeDriver: true,
        }).start(() => setIsMenuVisible(false));
    };

    const saveBusinessMode = () => {
        updateProfile({
            accountType: businessState.accountType,
            businessCategory: businessState.category,
            businessAddress: businessState.address,
        });
        closeMenu();
    };

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
                    {/* Top Right Menu Icon */}
                    <View className="flex-1 bg-black/15 p-4" style={{ paddingTop: insets.top }}>
                        <View className="flex-row justify-between">
                            <View />
                            <TouchableOpacity
                                className="w-[38px] h-[38px] rounded-full bg-black/40 justify-center items-center backdrop-blur-md border border-white/20"
                                onPress={openMenu}
                            >
                                <Ionicons name="menu" size={20} color="white" />
                            </TouchableOpacity>
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

                    {/* Edit Profile Button */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('EditProfile')}
                        className="w-full bg-gray-100 py-3 rounded-xl items-center mt-5 mb-2"
                    >
                        <Text className="text-[14px] font-bold text-gray-900">Editar Perfil</Text>
                    </TouchableOpacity>
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

            {/* Slide-in Menu Drawer */}
            <Modal visible={isMenuVisible} transparent animationType="none">
                <View className="flex-1 flex-row">
                    {/* Dark Overlay (tap to close) */}
                    <TouchableOpacity
                        className="absolute inset-0 bg-black/40"
                        activeOpacity={1}
                        onPress={closeMenu}
                    />

                    {/* Animated Menu Container */}
                    <Animated.View
                        style={{
                            transform: [{ translateX: slideAnim }],
                            width: width * 0.75,
                            backgroundColor: 'white',
                            height: '100%',
                            marginLeft: 'auto',
                            shadowColor: '#000',
                            shadowOffset: { width: -5, height: 0 },
                            shadowOpacity: 0.1,
                            shadowRadius: 10,
                            elevation: 5,
                            paddingTop: insets.top,
                            paddingBottom: insets.bottom,
                        }}
                    >
                        {/* Menu Header */}
                        <View className="px-5 py-4 border-b border-gray-100 flex-row justify-between items-center">
                            <Text className="text-lg font-bold text-gray-900">Menu</Text>
                            <TouchableOpacity onPress={closeMenu}>
                                <Ionicons name="close" size={24} color="#1F2937" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            {/* Generic Options */}
                            <View className="px-5 py-3 border-b border-gray-100">
                                <TouchableOpacity className="py-3 flex-row items-center gap-3">
                                    <Ionicons name="bookmark-outline" size={20} color="#374151" />
                                    <Text className="text-base text-gray-800">Itens salvos</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="py-3 flex-row items-center gap-3 mt-1">
                                    <Ionicons name="lock-closed-outline" size={20} color="#374151" />
                                    <Text className="text-base text-gray-800">Privacidade da conta</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Account Type Selection */}
                            <View className="px-5 py-5 border-b border-gray-100">
                                <Text className="text-sm font-bold text-gray-900 mb-3">Tipo de Perfil</Text>

                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        className={`flex-1 py-2.5 rounded-lg border flex-row items-center justify-center gap-2 ${businessState.accountType === 'personal' ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-200'}`}
                                        onPress={() => setBusinessState({ ...businessState, accountType: 'personal' })}
                                    >
                                        <Ionicons name="person-outline" size={16} color={businessState.accountType === 'personal' ? '#F97316' : '#6B7280'} />
                                        <Text className={`text-[13px] font-bold ${businessState.accountType === 'personal' ? 'text-orange-600' : 'text-gray-500'}`}>Pessoal</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`flex-1 py-2.5 rounded-lg border flex-row items-center justify-center gap-2 ${businessState.accountType === 'business' ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-200'}`}
                                        onPress={() => setBusinessState({ ...businessState, accountType: 'business' })}
                                    >
                                        <Ionicons name="briefcase-outline" size={16} color={businessState.accountType === 'business' ? '#F97316' : '#6B7280'} />
                                        <Text className={`text-[13px] font-bold ${businessState.accountType === 'business' ? 'text-orange-600' : 'text-gray-500'}`}>Negócio</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Business Fields Form */}
                                {businessState.accountType === 'business' && (
                                    <View className="mt-4 gap-3">
                                        <View>
                                            <Text className="text-[12px] font-semibold text-gray-500 mb-1">Categoria do Negócio</Text>
                                            <Input variant="outline" size="md" className="rounded-lg">
                                                <InputField
                                                    placeholder="Ex: Restaurante, Bar..."
                                                    value={businessState.category}
                                                    onChangeText={(t) => setBusinessState(p => ({ ...p, category: t }))}
                                                />
                                            </Input>
                                        </View>
                                        <View>
                                            <Text className="text-[12px] font-semibold text-gray-500 mb-1">Endereço Completo</Text>
                                            <Input variant="outline" size="md" className="rounded-lg">
                                                <InputField
                                                    placeholder="Endereço exato..."
                                                    value={businessState.address}
                                                    onChangeText={(t) => setBusinessState(p => ({ ...p, address: t }))}
                                                />
                                            </Input>
                                        </View>
                                        <TouchableOpacity
                                            className="bg-gray-900 rounded-lg py-3 items-center mt-2"
                                            onPress={saveBusinessMode}
                                        >
                                            <Text className="text-white font-bold text-sm">Salvar Informações</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            {/* Logout Area */}
                            <TouchableOpacity
                                className="px-5 py-5 flex-row items-center gap-3 mt-auto"
                                onPress={() => { closeMenu(); logout(); }}
                            >
                                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                                <Text className="text-base text-red-500 font-bold">Sair / Logout</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};