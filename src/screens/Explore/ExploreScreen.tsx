import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { SectionHeader } from '../../components/SectionHeader';
import { SocialRouteCard } from '../../components/SocialRouteCard';
import { CommunityCard } from '../../components/CommunityCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_ROUTES, MOCK_PLACES, MOCK_COMMUNITIES } from '../../data/mockData';
import { SearchBar } from '../../components/SearchBar';
import { useUIStore } from '../../store/useUIStore';
import { ExploreTab } from '../../types';

const { width } = Dimensions.get('window');

const EXPLORE_TABS: ExploreTab[] = ['Tudo', 'Recomendados', 'Rotas de viagem', 'Internacional', 'Hoje'];

const QUICK_FILTERS = [
    { id: '1', name: 'Family Friendly', icon: '👨‍👩‍👧‍👦' },
    { id: '2', name: 'Romantico', icon: '💑' },
    { id: '3', name: 'Aventura', icon: '🏔️' },
    { id: '4', name: 'Cultural', icon: '🎭' },
];

export const ExploreScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { searchQuery, setSearchQuery, activeExploreTab, setActiveExploreTab } = useUIStore();
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Search */}
                <View className="px-5 pt-2 mb-4">
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFilterPress={() => navigation.navigate('ExploreFilters')}
                    />
                </View>

                {/* Quick Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 10, marginBottom: 20 }}
                >
                    {QUICK_FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter.id}
                            className={`flex-row items-center px-4 py-[10px] rounded-3xl border-[1.5px] gap-[6px] ${activeFilter === filter.id
                                ? 'bg-primary border-primary'
                                : 'bg-background border-border'
                                }`}
                            onPress={() => setActiveFilter(activeFilter === filter.id ? null : filter.id)}
                            activeOpacity={0.7}
                        >
                            <Text className="text-base">{filter.icon}</Text>
                            <Text
                                className={`text-[13px] font-medium ${activeFilter === filter.id
                                    ? 'text-textInverse'
                                    : 'text-text'
                                    }`}
                            >
                                {filter.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Header */}
                <View className="px-5 mb-3">
                    <Text className="text-2xl font-bold text-gray-900">Explorar</Text>
                </View>

                {/* Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 20, marginBottom: 12 }}
                >
                    {EXPLORE_TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveExploreTab(tab)}
                            className="items-center"
                            activeOpacity={0.7}
                        >
                            <Text
                                className={`text-sm pb-[6px] ${activeExploreTab === tab
                                    ? 'text-gray-900 font-bold'
                                    : 'text-gray-400 font-medium'
                                    }`}
                            >
                                {tab}
                            </Text>
                            {activeExploreTab === tab && (
                                <View className="w-6 h-[3px] bg-primary rounded-[1.5px]" />
                            )}
                        </TouchableOpacity>
                    ))}
                </ScrollView>

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
