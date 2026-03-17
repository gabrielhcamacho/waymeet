import React from 'react';
import { View } from 'react-native';
import { Text } from '@/src/components/ui/text';

interface ProfileStatsProps {
    followersCount: number;
    followingCount: number;
    eventsCount: number;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
    followersCount,
    followingCount,
    eventsCount,
}) => (
    <View className="flex-row items-center mx-5 mt-5 gap-6 bg-gray-50 py-4 px-8 rounded-2xl justify-center">
        {[
            { value: followersCount, label: 'Seguidores' },
            { value: followingCount, label: 'Seguindo' },
            { value: eventsCount, label: 'Encontros' },
        ].map((stat, i, arr) => (
            <React.Fragment key={stat.label}>
                <View className="items-center">
                    <Text className="text-lg font-bold text-gray-900">{stat.value}</Text>
                    <Text className="text-[11px] text-gray-400 mt-0.5">{stat.label}</Text>
                </View>
                {i < arr.length - 1 && <View className="w-px h-[30px] bg-gray-200" />}
            </React.Fragment>
        ))}
    </View>
);