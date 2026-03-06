import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';

interface ConfirmationBarProps {
    interested: number;
    confirmed: number;
    arrived: number;
    compact?: boolean;
}

export const ConfirmationBar: React.FC<ConfirmationBarProps> = ({
    interested,
    confirmed,
    arrived,
    compact = false,
}) => {
    if (compact) {
        return (
            <View className="flex-row items-center gap-3">
                <View className="flex-row items-center gap-1">
                    <Ionicons name="heart-outline" size={12} color="#9CA3AF" />
                    <Text className="text-[11px] text-gray-400 font-medium">{interested}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <Ionicons name="checkmark-circle-outline" size={12} color="#22C55E" />
                    <Text className="text-[11px] text-green-500 font-medium">{confirmed}</Text>
                </View>
                {arrived > 0 && (
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="location" size={12} color="#FF7A00" />
                        <Text className="text-[11px] text-orange-500 font-medium">{arrived}</Text>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 gap-4">
            <View className="flex-1 items-center">
                <View className="flex-row items-center gap-1.5 mb-0.5">
                    <Ionicons name="heart-outline" size={16} color="#9CA3AF" />
                    <Text className="text-base font-bold text-gray-800">{interested}</Text>
                </View>
                <Text className="text-[10px] text-gray-400 font-medium">interessados</Text>
            </View>
            <View className="w-px h-[28px] bg-gray-200" />
            <View className="flex-1 items-center">
                <View className="flex-row items-center gap-1.5 mb-0.5">
                    <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                    <Text className="text-base font-bold text-green-600">{confirmed}</Text>
                </View>
                <Text className="text-[10px] text-gray-400 font-medium">confirmados</Text>
            </View>
            <View className="w-px h-[28px] bg-gray-200" />
            <View className="flex-1 items-center">
                <View className="flex-row items-center gap-1.5 mb-0.5">
                    <Ionicons name="location" size={16} color="#FF7A00" />
                    <Text className="text-base font-bold text-orange-500">{arrived}</Text>
                </View>
                <Text className="text-[10px] text-gray-400 font-medium">no local</Text>
            </View>
        </View>
    );
};
