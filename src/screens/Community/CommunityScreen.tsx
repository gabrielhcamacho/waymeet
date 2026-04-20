import React, { useEffect } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Plus } from 'lucide-react-native';
import { Text } from '@/src/components/ui/text';
import { EventCard } from '../../components/EventCard';
import { useEventsStore } from '../../store/useEventsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Divider } from '@/src/components/ui/divider';

export const CommunityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { events, fetchEvents } = useEventsStore();

    useEffect(() => { fetchEvents(); }, []);

    return (
        <View className="flex-1 bg-background">
            <View className="flex flex-col p-4 gap-y-1 mb-2 flex-row items-start justify-between" style={{ paddingTop: insets.top + 16 }}>
                <View className="flex-1">
                    <Text className="text-2xl font-bold text-text">Comunidade</Text>
                    <Text className="text-md text-textSecondary mt-1">
                        Encontros próximos a você e de quem você segue
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('CreateCommunity')}
                    activeOpacity={0.8}
                    className="flex-row items-center gap-1.5 bg-gray-900 rounded-full px-4 py-2.5 ml-3 mt-1"
                >
                    <Plus size={15} color="white" strokeWidth={2.5} />
                    <Text className="text-[13px] font-bold text-white">Criar</Text>
                </TouchableOpacity>
            </View>
            <Divider className="mb-3" />
            <FlatList
                data={events}
                renderItem={({ item }) => (
                    <EventCard
                        event={item}
                        onPress={() => navigation.navigate('EventDetail', { event: item })}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center py-16">
                        <View className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center mb-4">
                            <Ionicons name="people-outline" size={28} color="#9CA3AF" />
                        </View>
                        <Text className="text-[15px] font-semibold text-gray-700 mb-1">Nenhum encontro ainda</Text>
                        <Text className="text-[13px] text-gray-400 text-center px-8">
                            Crie uma comunidade para reunir pessoas com os mesmos interesses
                        </Text>
                    </View>
                }
            />
        </View>
    );
};
