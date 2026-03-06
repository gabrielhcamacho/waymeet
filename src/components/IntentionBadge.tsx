import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { SocialIntention } from '../types';

interface IntentionBadgeProps {
    intention: SocialIntention;
    onPress?: () => void;
}

export const IntentionBadge: React.FC<IntentionBadgeProps> = ({ intention, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            className="flex-row items-center bg-orange-50 border border-orange-200 rounded-full px-4 py-2.5 mr-3 mb-2"
        >
            <Text className="text-base mr-1.5">{intention.emoji}</Text>
            <Text className="text-sm font-semibold text-gray-800 mr-1.5">{intention.label}</Text>
            <View className="bg-orange-500 rounded-full px-2 py-0.5 min-w-[24px] items-center">
                <Text className="text-[11px] font-bold text-white">{intention.activeCount}</Text>
            </View>
        </TouchableOpacity>
    );
};
