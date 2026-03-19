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
    activeTab: 'eventos' | 'participacoes' | 'sobre';
    onTabChange: (tab: 'eventos' | 'participacoes' | 'sobre') => void;
    events: Event[];
    participatedEvents: Event[];
    bio: string;
    homeCity: string;
    onEventPress: (event: Event) => void;
};

const TABS: { key: 'eventos' | 'participacoes' | 'sobre'; label: string }[] = [
    { key: 'eventos', label: 'Encontros' },
    { key: 'participacoes', label: 'Encontros Participados' },
    { key: 'sobre', label: 'Sobre' },
];

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
    activeTab,
    onTabChange,
    events,
    bio,
    homeCity,
    participatedEvents,
    onEventPress,
}) => (
    <>
        <View className="flex-row border-b border-gray-100 mt-6 mx-5">
            {TABS.map((tab) => (
                <TouchableOpacity
                    key={tab.key}
                    className={`flex-1 items-center py-3 ${activeTab === tab.key ? "border-b-2 border-orange-500" : ""}`}
                    onPress={() => onTabChange(tab.key)}
                >
                    <Text className={`text-xs font-medium ${activeTab === tab.key ? 'text-orange-500 font-bold' : 'text-gray-400'}`}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        <View className="p-5">
            {activeTab === 'eventos' && (
                <>
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} onPress={() => onEventPress(event)} />
                    ))}
                    {events.length === 0 && (
                        <View className="items-center py-10 gap-3">
                            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                            <Text className="text-sm text-gray-400">Nenhum encontro criado ainda</Text>
                        </View>
                    )}
                </>
            )}

            {activeTab === 'participacoes' && (
                <>
                    {participatedEvents.map((event) => (
                        <EventCard key={event.id} event={event} onPress={() => onEventPress(event)} />
                    ))}
                    {participatedEvents.length === 0 && (
                        <View className="items-center py-10 gap-3">
                            <Ionicons name="people-outline" size={48} color="#9CA3AF" />
                            <Text className="text-sm text-gray-400">Nenhuma participação ainda</Text>
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