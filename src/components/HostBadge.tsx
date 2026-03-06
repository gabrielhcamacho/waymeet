import React from 'react';
import { View } from 'react-native';
import { Text } from '@/src/components/ui/text';

interface HostBadgeProps {
    eventsCount: number;
}

export const HostBadge: React.FC<HostBadgeProps> = ({ eventsCount }) => {
    return (
        <View className="flex-row items-center bg-amber-50 border border-amber-300 rounded-2xl px-4 py-2.5 gap-2">
            <Text className="text-base">⭐</Text>
            <View>
                <Text className="text-sm font-bold text-amber-700">Host Local</Text>
                <Text className="text-[11px] text-amber-500 font-medium">
                    {eventsCount} encontros organizados
                </Text>
            </View>
        </View>
    );
};
