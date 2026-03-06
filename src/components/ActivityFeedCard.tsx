import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { ActivityFeedItem } from '../types';

interface ActivityFeedCardProps {
    item: ActivityFeedItem;
    onPress?: () => void;
}

function timeAgo(timestamp: string): string {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `há ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `há ${hours}h`;
    return `há ${Math.floor(hours / 24)}d`;
}

const TYPE_ICON: Record<string, { name: string; color: string }> = {
    event_created: { name: 'add-circle', color: '#10B981' },
    user_arrived: { name: 'location', color: '#3B82F6' },
    route_started: { name: 'navigate', color: '#8B5CF6' },
    intention_set: { name: 'sparkles', color: '#F59E0B' },
    community_joined: { name: 'people', color: '#EC4899' },
    event_joined: { name: 'checkmark-circle', color: '#14B8A6' },
};

export const ActivityFeedCard: React.FC<ActivityFeedCardProps> = ({ item, onPress }) => {
    const icon = TYPE_ICON[item.type] || { name: 'ellipse', color: '#9CA3AF' };

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center px-5 py-2.5"
        >
            {/* Avatar */}
            <View className="relative mr-3">
                <Image
                    source={{ uri: item.userAvatar }}
                    className="w-9 h-9 rounded-full bg-gray-100"
                />
                <View
                    className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full items-center justify-center border-2 border-white"
                    style={{ backgroundColor: icon.color }}
                >
                    <Ionicons name={icon.name as any} size={9} color="white" />
                </View>
            </View>

            {/* Text */}
            <View className="flex-1">
                <Text className="text-[13px] text-gray-700" numberOfLines={1}>
                    <Text className="font-bold text-gray-900">{item.userName}</Text>
                    {' '}{item.description}
                </Text>
                {item.metadata?.locationName && (
                    <View className="flex-row items-center mt-0.5">
                        <Ionicons name="location-outline" size={10} color="#9CA3AF" />
                        <Text className="text-[11px] text-gray-400 ml-0.5">{item.metadata.locationName}</Text>
                    </View>
                )}
            </View>

            {/* Timestamp */}
            <Text className="text-[11px] text-gray-300 ml-2">{timeAgo(item.timestamp)}</Text>
        </TouchableOpacity>
    );
};
