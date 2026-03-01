import React, { useState, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { SearchBar } from '../../components/SearchBar';
import { ItineraryCard } from '../../components/ItineraryCard';
import { PlaceCard } from '../../components/PlaceCard';
import { MOCK_ITINERARIES, MOCK_PLACES } from '../../data/mockData';
import { useUIStore } from '../../store/useUIStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExploreTab } from '../../types';

const EXPLORE_TABS: ExploreTab[] = ['Tudo', 'Recomendados', 'Rotas de viagem', 'Internacional', 'Hoje'];

const QUICK_FILTERS = [
    { id: '1', name: 'Family Friendly', icon: '👨‍👩‍👧‍👦' },
    { id: '2', name: 'Romantico', icon: '💑' },
    { id: '3', name: 'Aventura', icon: '🏔️' },
    { id: '4', name: 'Cultural', icon: '🎭' },
];

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { searchQuery, setSearchQuery, activeExploreTab, setActiveExploreTab } = useUIStore();
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Colors.primary}
                    />
                }
            >
                {/* Search */}
                <View className="px-5 mb-4">
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

                {/* Explorar Section */}
                <View className="mb-6">
                    <Text className="text-xl font-bold text-text px-5 mb-3">
                        Explorar
                    </Text>

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
                                        ? 'text-text font-bold'
                                        : 'text-textMuted font-medium'
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

                    {/* See More Row */}
                    <View className="flex-row justify-end px-5 mb-2">
                        <TouchableOpacity>
                            <Text className="text-[13px] text-primary font-medium">Ver mais...</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Itineraries */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                        {MOCK_ITINERARIES.map((item) => (
                            <ItineraryCard key={item.id} item={item} onPress={() => { }} />
                        ))}
                    </ScrollView>
                </View>

                {/* Em Alta Section */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center px-5">
                        <Text className="text-xl font-bold text-text mb-3">Em Alta</Text>
                        <TouchableOpacity>
                            <Text className="text-[13px] text-primary font-medium">Ver mais...</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20 }}
                    >
                        {MOCK_PLACES.map((item) => (
                            <PlaceCard key={item.id} item={item} onPress={() => { }} />
                        ))}
                    </ScrollView>
                </View>

                <View className="h-5" />
            </ScrollView>
        </View>
    );
};