import React, { useState, useCallback, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommunityCard } from '../../components/CommunityCard';
import { useCommunityStore } from '../../store/useCommunityStore';
import { useCategoriesStore } from '../../store/useCategoriesStore';
import { MOCK_COMMUNITIES } from '../../data/mockData';

export const AllCommunitiesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const { communities, fetchCommunities } = useCommunityStore();
    const { categories, fetchCategories } = useCategoriesStore();

    useEffect(() => {
        fetchCommunities();
        fetchCategories();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchCommunities();
        setRefreshing(false);
    }, []);

    const base = communities.length > 0 ? communities : MOCK_COMMUNITIES;
    const filteredCommunities = base.filter(c => {
        if (!selectedCategory) return true;
        const cat = categories.find(cat => cat.id === selectedCategory);
        if (!cat) return true;
        const label = cat.name.toLowerCase();
        return (
            c.name.toLowerCase().includes(label) ||
            c.description.toLowerCase().includes(label)
        );
    });

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
                <Text className="text-lg font-bold text-gray-900 ml-2">Comunidades</Text>
            </View>

            {/* Category filter chips */}
            <View className="bg-white border-b border-gray-100">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[{ id: null as any, name: 'Todas', icon: 'apps-outline', color: '#6B7280' }, ...categories]}
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
            </View>

            {/* Communities list */}
            <FlatList
                data={filteredCommunities}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#222" />
                }
                renderItem={({ item }) => (
                    <View className="mb-3">
                        <CommunityCard
                            community={item}
                            onPress={() => navigation.navigate('CommunityDetail', { community: item })}
                        />
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center py-16">
                        <Ionicons name="people-outline" size={40} color="#D1D5DB" />
                        <Text className="text-gray-400 text-sm mt-3 font-medium">
                            Nenhuma comunidade encontrada
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
