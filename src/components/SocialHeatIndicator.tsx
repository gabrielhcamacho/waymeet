import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '@/src/components/ui/text';
import { HeatZone } from '../types';

interface SocialHeatIndicatorProps {
    zone: HeatZone;
}

export const SocialHeatIndicator: React.FC<SocialHeatIndicatorProps> = ({ zone }) => {
    const barWidth = `${Math.round(zone.intensity * 100)}%`;

    return (
        <View className="flex-row items-center mb-3 px-1">
            <Text className="text-sm font-medium text-gray-700 w-[100px]" numberOfLines={1}>
                {zone.name}
            </Text>
            <View className="flex-1 h-[10px] bg-gray-100 rounded-full overflow-hidden ml-3">
                <LinearGradient
                    colors={['#FFA54C', '#FF4500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                        width: barWidth as any,
                        height: '100%',
                        borderRadius: 999,
                    }}
                />
            </View>
            {zone.intensity >= 0.7 && (
                <Ionicons name="flame" size={14} color="#EF4444" style={{ marginLeft: 8 }} />
            )}
        </View>
    );
};
