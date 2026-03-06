import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { NearbyActivity } from '../types';

interface NearbyActivityCardProps {
    activity: NearbyActivity;
    onPress?: () => void;
}

export const NearbyActivityCard: React.FC<NearbyActivityCardProps> = ({ activity, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className="bg-white rounded-2xl px-4 py-4 mb-3 mx-5 flex-row items-center border border-gray-100"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            {/* Emoji container */}
            <View className="w-12 h-12 bg-orange-50 rounded-2xl items-center justify-center mr-4">
                <Text className="text-2xl">{activity.emoji}</Text>
            </View>

            {/* Content */}
            <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">{activity.label}</Text>
                <View className="flex-row items-center mt-0.5 gap-2">
                    <Text className="text-[13px] text-orange-500 font-semibold">
                        {activity.peopleCount} pessoas
                    </Text>
                    <Text className="text-gray-300">·</Text>
                    <Text className="text-[13px] text-gray-400">{activity.distance}</Text>
                </View>
            </View>

            {/* Time badge */}
            <View className="bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
                <Text className="text-[11px] font-semibold text-green-600">{activity.time}</Text>
            </View>
        </TouchableOpacity>
    );
};
