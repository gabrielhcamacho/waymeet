import React from 'react';
import { View, FlatList } from 'react-native';
import { Colors } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { EventCard } from '../../components/EventCard';
import { useEventsStore } from '../../store/useEventsStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Divider } from '@/src/components/ui/divider';

export const CommunityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { events } = useEventsStore();

    return (
        <View className="flex-1 bg-background">
            <View className="flex flex-col p-4 gap-y-2 mb-2">
                <Text className="text-2xl font-bold text-text">Fique por dentro da sua comunidade</Text>
                <Text className="text-md text-textSecondary mt-1">Veja os eventos próximos a você e das pessoas que você segue</Text>
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
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};