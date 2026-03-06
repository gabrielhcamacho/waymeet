import React from 'react';
import { View, ScrollView, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { SectionHeader } from '../../components/SectionHeader';
import { SocialRouteCard } from '../../components/SocialRouteCard';
import { CommunityCard } from '../../components/CommunityCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_ROUTES, MOCK_PLACES, MOCK_COMMUNITIES } from '../../data/mockData';

const { width } = Dimensions.get('window');

export const ExploreScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-5 pt-4 pb-4">
                    <Text className="text-2xl font-bold text-gray-900">Explorar</Text>
                    <Text className="text-[14px] text-gray-400 mt-1">
                        Descubra lugares, rotas e comunidades
                    </Text>
                </View>

                {/* Social Routes */}
                <View className="mb-5">
                    <SectionHeader title="Rotas sociais" />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                        {MOCK_ROUTES.map((route) => (
                            <SocialRouteCard
                                key={route.id}
                                route={route}
                                onPress={() => navigation.navigate('RouteDetail', { socialRoute: route })}
                            />
                        ))}
                    </ScrollView>
                </View>

                {/* Divider */}
                <View className="h-2 bg-gray-50 mb-4" />

                {/* Popular Places */}
                <View className="mb-5">
                    <SectionHeader title="Lugares populares" />
                    {MOCK_PLACES.slice(0, 4).map((place) => (
                        <TouchableOpacity
                            key={place.id}
                            onPress={() => navigation.navigate('PlaceDetail', { place })}
                            activeOpacity={0.8}
                            className="flex-row items-center px-5 py-3"
                        >
                            <ImageBackground
                                source={{ uri: place.imageUrl }}
                                className="w-[60px] h-[60px]"
                                imageStyle={{ borderRadius: 12 }}
                            />
                            <View className="flex-1 ml-3">
                                <Text className="text-[14px] font-semibold text-gray-900" numberOfLines={1}>
                                    {place.name}
                                </Text>
                                <Text className="text-[12px] text-gray-400 mt-0.5" numberOfLines={1}>
                                    {place.category} · {place.address}
                                </Text>
                                <View className="flex-row items-center gap-1 mt-1">
                                    <Ionicons name="star" size={11} color="#FBBF24" />
                                    <Text className="text-[11px] text-gray-500 font-medium">{place.rating}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Divider */}
                <View className="h-2 bg-gray-50 mb-4" />

                {/* Communities */}
                <View className="mb-8">
                    <SectionHeader title="Comunidades" />
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
        </View>
    );
};
