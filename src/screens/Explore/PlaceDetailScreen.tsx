import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ImageBackground, Image, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Place } from '../../types';
import { SectionHeader } from '../../components/SectionHeader';
import { EventCard } from '../../components/EventCard';
import { ActivityFeedCard } from '../../components/ActivityFeedCard';
import { useEventsStore } from '../../store/useEventsStore';
import { usePresenceStore } from '../../store/usePresenceStore';
import { useActivityFeedStore } from '../../store/useActivityFeedStore';
import { MOCK_USERS } from '../../data/mockData';

export const PlaceDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const { place } = route.params as { place: Place };

    const { events } = useEventsStore();
    const { getActiveNearby } = usePresenceStore();
    const { recentActivities } = useActivityFeedStore();

    const [showGallery, setShowGallery] = useState(false);
    const photos = [
        place.imageUrl,
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=400&h=300&fit=crop'
    ];

    // 1. Social Activity Calculation
    const activePeopleHere = useMemo(() => {
        // Find people within ~500m of this place
        return getActiveNearby(place.latitude, place.longitude, 0.5);
    }, [place.latitude, place.longitude]);

    const placeEvents = useMemo(() => {
        return events.filter(e =>
            e.locationName?.toLowerCase() === place.name.toLowerCase() ||
            (e.latitude === place.latitude && e.longitude === place.longitude)
        );
    }, [events, place]);

    const placeActivityFeed = useMemo(() => {
        return recentActivities.filter(a => a.metadata?.locationName?.toLowerCase() === place.name.toLowerCase()).slice(0, 3);
    }, [recentActivities, place]);

    // Format quick info
    const quickInfo = [
        { icon: 'time-outline', label: '18:00 - 02:00', sub: 'Aberto agora', color: '#10B981' },
        { icon: 'wallet-outline', label: '$$', sub: 'R$ 40-100', color: '#6B7280' },
        { icon: 'navigate-outline', label: '1.2 km', sub: '15 min de carro', color: '#6B7280' },
    ];

    const usefulLinks = [
        { icon: 'restaurant-outline', label: 'Ver Cardápio' },
        { icon: 'logo-instagram', label: 'Instagram' },
        { icon: 'globe-outline', label: 'Website' },
        { icon: 'calendar-outline', label: 'Reservas' },
    ];

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* ── Hero Image ── */}
                <ImageBackground
                    source={{ uri: place.imageUrl }}
                    className="w-full h-[280px] justify-end"
                >
                    <View className="bg-black/50 px-5 pb-6 pt-16">
                        <View className="flex-row items-center flex-wrap gap-2 mb-2">
                            {place.categoryIcons.map((icon, i) => (
                                <View key={i} className="bg-white/20 px-2 py-1 rounded-full flex-row items-center gap-1">
                                    <Text className="text-sm">{icon}</Text>
                                    <Text className="text-[11px] font-bold text-white capitalize">
                                        {place.category}
                                    </Text>
                                </View>
                            ))}
                            <View className="bg-amber-500/90 px-2 py-1 rounded-full flex-row items-center gap-1">
                                <Ionicons name="star" size={12} color="white" />
                                <Text className="text-[12px] font-bold text-white">{place.rating}</Text>
                            </View>
                        </View>
                        <Text className="text-white text-3xl font-extrabold shadow-sm">
                            {place.name}
                        </Text>
                        <Text className="text-white/80 text-sm mt-1" numberOfLines={2}>
                            {place.description}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="absolute left-5 bg-white/90 w-10 h-10 rounded-full items-center justify-center"
                        style={{ top: insets.top + 4 }}
                    >
                        <Ionicons name="arrow-back" size={20} color="#1F2937" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setShowGallery(true)}
                        className="absolute right-5 bg-white/30 backdrop-blur-md w-10 h-10 rounded-full items-center justify-center border border-white/40"
                        style={{ top: insets.top + 4 }}
                    >
                        <Ionicons name="images" size={18} color="white" />
                    </TouchableOpacity>
                </ImageBackground>

                {/* ── Informações Rápidas ── */}
                <View className="px-5 py-5 border-b border-gray-100">
                    <View className="flex-row items-center gap-3 mb-4">
                        <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center">
                            <Ionicons name="location" size={18} color="#4B5563" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-gray-900">{place.address}</Text>
                            <Text className="text-[12px] text-gray-500">{place.city}</Text>
                        </View>
                    </View>

                    <View className="flex-row gap-2 mb-4">
                        {quickInfo.map((info, i) => (
                            <View key={i} className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <Ionicons name={info.icon as any} size={18} color="#4B5563" style={{ marginBottom: 4 }} />
                                <Text className="text-[12px] font-bold text-gray-900">{info.label}</Text>
                                <Text className="text-[10px] text-gray-500" style={{ color: info.color }}>{info.sub}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Links */}
                    <View className="flex-row flex-wrap gap-2">
                        {usefulLinks.map((link, i) => (
                            <TouchableOpacity key={i} activeOpacity={0.7} className="flex-row items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-2 rounded-full">
                                <Ionicons name={link.icon as any} size={14} color="#4B5563" />
                                <Text className="text-[12px] font-semibold text-gray-700">{link.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* ── Atividade Social ── */}
                <View className="px-5 py-5 border-b border-gray-100">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Atividade Social</Text>

                    <View className="flex-row items-center gap-4 mb-5">
                        <View className="flex-1 bg-orange-50 rounded-2xl p-4 items-center justify-center border border-orange-100">
                            <View className="flex-row items-center gap-2 mb-1">
                                <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                <Text className="text-2xl font-bold text-orange-600">
                                    {activePeopleHere.length > 0 ? activePeopleHere.length : (Math.floor(Math.random() * 15) + 3)}
                                </Text>
                            </View>
                            <Text className="text-[11px] font-bold text-orange-800 uppercase tracking-wider text-center">
                                Pessoas Agora
                            </Text>
                        </View>

                        <View className="flex-1 bg-blue-50 rounded-2xl p-4 items-center justify-center border border-blue-100">
                            <Text className="text-2xl font-bold text-blue-600 mb-1">
                                {placeEvents.length}
                            </Text>
                            <Text className="text-[11px] font-bold text-blue-800 uppercase tracking-wider text-center">
                                Encontros Linkados
                            </Text>
                        </View>
                    </View>

                    {/* Recent place activity if any */}
                    {placeActivityFeed.length > 0 && (
                        <View className="mt-2 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                            <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                Movimento Recente
                            </Text>
                            {placeActivityFeed.map((item) => (
                                <ActivityFeedCard key={item.id} item={item} onPress={() => { }} />
                            ))}
                        </View>
                    )}
                </View>

                {/* ── Encontros no local ── */}
                {placeEvents.length > 0 && (
                    <View className="py-5 border-b border-gray-100">
                        <SectionHeader title="Encontros no local" />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
                            {placeEvents.map(event => (
                                <View key={event.id} className="w-[280px]">
                                    <EventCard
                                        event={event}
                                        onPress={() => navigation.navigate('EventDetail', { event })}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* (Infos moved up) */}

                {/* ── Reivindicar Lugar ── */}
                <View className="px-5 py-8 items-center">
                    <Text className="text-xs text-gray-400 text-center mb-2">
                        Você é proprietário deste estabelecimento?
                    </Text>
                    <TouchableOpacity activeOpacity={0.7}>
                        <Text className="text-[13px] font-bold text-primary underline">
                            Reivindicar este lugar
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom space for fixed buttons */}
                <View className="h-[140px]" />
            </ScrollView>

            {/* ── Bottom Fixed Actions ── */}
            <View
                className="absolute bottom-0 left-0 right-0 px-5 pt-3 bg-white border-t border-gray-100 flex-row gap-3"
                style={{ paddingBottom: insets.bottom + 12 }}
            >
                <TouchableOpacity
                    activeOpacity={0.8}
                    className="flex-1 bg-gray-100 rounded-2xl py-4 items-center flex-row justify-center gap-2"
                >
                    <Ionicons name="map" size={18} color="#1F2937" />
                    <Text className="text-[15px] font-bold text-gray-900">Ir Agora</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('MapTab', {
                        screen: 'CreateEvent',
                        params: {
                            initialLocation: place.name,
                            initialLatitude: place.latitude,
                            initialLongitude: place.longitude
                        }
                    })}
                    className="flex-1 bg-orange-500 rounded-2xl py-4 items-center flex-row justify-center gap-2"
                    style={{
                        shadowColor: '#F97316',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                    }}
                >
                    <Ionicons name="add-circle" size={20} color="white" />
                    <Text className="text-[15px] font-bold text-white">Criar Encontro</Text>
                </TouchableOpacity>
            </View>

            {/* Gallery Modal */}
            <Modal visible={showGallery} transparent animationType="fade">
                <View className="flex-1 bg-black">
                    <TouchableOpacity
                        onPress={() => setShowGallery(false)}
                        className="absolute right-5 bg-white/20 w-10 h-10 rounded-full items-center justify-center z-50"
                        style={{ top: insets.top + 10 }}
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        className="flex-1"
                    >
                        {photos.map((img, i) => (
                            <View key={i} style={{ width: Dimensions.get('window').width, justifyContent: 'center', alignItems: 'center' }}>
                                <Image
                                    source={{ uri: img }}
                                    style={{ width: '100%', height: 400 }}
                                    resizeMode="cover"
                                />
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
};
