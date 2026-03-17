import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { EventCard } from '@/src/components/EventCard';

interface Event {
    id: string;
    creatorId: string;
    [key: string]: any;
}

interface ProfileTabsProps {
    activeTab: 'eventos' | 'sobre';
    onTabChange: (tab: 'eventos' | 'sobre') => void;
    events: Event[];
    bio: string;
    homeCity: string;
    onEventPress: (event: Event) => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
    activeTab,
    onTabChange,
    events,
    bio,
    homeCity,
    onEventPress,
}) => (
    <>
        <View className="flex-row border-b border-gray-100 mt-6 mx-5">
            {(['eventos', 'sobre'] as const).map((tab) => (
                <TouchableOpacity
                    key={tab}
                    className={`flex-1 items-center py-3 ${activeTab === tab ? 'border-b-2 border-orange-500' : ''}`}
                    onPress={() => onTabChange(tab)}
                >
                    <Text className={`text-sm font-medium ${activeTab === tab ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                        {tab === 'eventos' ? 'Encontros' : 'Sobre'}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        <View className="p-5">
            {activeTab === 'eventos' && (
                <>
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onPress={() => onEventPress(event)}
                        />
                    ))}
                    {events.length === 0 && (
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
                        <Text className="text-[15px] text-gray-700 leading-6">{bio || 'Nenhuma bio definida'}</Text>
                    </View>
                    <View>
                        <Text className="text-sm font-semibold text-gray-500 mb-1">Cidade</Text>
                        <Text className="text-[15px] text-gray-700">{homeCity || 'Não definida'}</Text>
                    </View>
                </View>
            )}
        </View>
    </>
);