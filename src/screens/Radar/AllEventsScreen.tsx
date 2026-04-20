import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventCard } from '../../components/EventCard';
import { useEventsStore } from '../../store/useEventsStore';
import { useCategoriesStore } from '../../store/useCategoriesStore';

const DISTANCE_OPTIONS = [5, 10, 25, 50];

export const AllEventsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [distanceKm, setDistanceKm] = useState(10);
    const [refreshing, setRefreshing] = useState(false);
    const { events, fetchEvents } = useEventsStore();
    const { categories, fetchCategories } = useCategoriesStore();

    useEffect(() => {
        fetchEvents();
        fetchCategories();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchEvents();
        setRefreshing(false);
    }, []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredEvents = events
        .filter(e => !e.isEphemeral)
        .filter(e => new Date(e.date) >= today)
        .filter(e => {
            if (!selectedCategory) return true;
            const cat = categories.find(c => c.id === selectedCategory);
            if (!cat) return true;
            return e.category.toLowerCase().includes(cat.name.toLowerCase());
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 items-center justify-center rounded-full"
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 ml-2">Próximos Encontros</Text>
            </View>

            {/* Category filter chips */}
            <View className="bg-white border-b border-gray-100">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[{ id: null as any, name: 'Todos', icon: 'apps-outline', color: '#6B7280' }, ...categories]}
                    keyExtractor={item => item.id ?? 'all'}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
                    renderItem={({ item }) => {
                        const isActive = selectedCategory === item.id;
                        return (
                            <TouchableOpacity
                                onPress={() => setSelectedCategory(item.id)}
                                activeOpacity={0.75}
                                className={`flex-row items-center px-3 py-2 rounded-full border gap-1.5 ${
                                    isActive
                                        ? 'bg-gray-900 border-gray-900'
                                        : 'bg-gray-50 border-gray-200'
                                }`}
                            >
                                <Ionicons
                                    name={item.icon as any}
                                    size={14}
                                    color={isActive ? '#fff' : item.color}
                                />
                                <Text className={`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />

                {/* Distance filter */}
                <View className="flex-row items-center px-4 pb-3 gap-2">
                    <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                    <Text className="text-[12px] text-gray-400 mr-2">Raio:</Text>
                    {DISTANCE_OPTIONS.map(d => (
                        <TouchableOpacity
                            key={d}
                            onPress={() => setDistanceKm(d)}
                            activeOpacity={0.75}
                            className={`px-3 py-1 rounded-full border ${
                                distanceKm === d
                                    ? 'bg-gray-900 border-gray-900'
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <Text className={`text-[12px] font-semibold ${distanceKm === d ? 'text-white' : 'text-gray-600'}`}>
                                {d}km
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Events list */}
            <FlatList
                data={filteredEvents}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#222" />
                }
                renderItem={({ item }) => (
                    <View className="mb-3">
                        <EventCard
                            event={item}
                            onPress={() => navigation.navigate('EventDetail', { event: item })}
                        />
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center py-16">
                        <Ionicons name="calendar-outline" size={40} color="#D1D5DB" />
                        <Text className="text-gray-400 text-sm mt-3 font-medium">
                            Nenhum encontro encontrado
                        </Text>
                        <Text className="text-gray-300 text-[12px] mt-1">
                            Tente mudar o filtro de categoria
                        </Text>
                    </View>
                }
            />
        </View>
    );
};
