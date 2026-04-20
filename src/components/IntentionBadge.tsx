import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { SocialIntention } from '../types';

interface IntentionBadgeProps {
    intention: SocialIntention;
    onPress?: () => void;
}

const INTENTION_ICONS: Record<string, { name: string; color: string }> = {
    cafe:            { name: 'cafe-outline',        color: '#92400E' },
    drinks:          { name: 'wine-outline',         color: '#7C3AED' },
    esporte:         { name: 'fitness-outline',      color: '#1D4ED8' },
    explorar:        { name: 'compass-outline',      color: '#16A34A' },
    musica:          { name: 'musical-notes-outline',color: '#DB2777' },
    yoga:            { name: 'body-outline',         color: '#0891B2' },
    trabalhar_cafe:  { name: 'laptop-outline',       color: '#D97706' },
    anti_solidao:    { name: 'people-outline',       color: '#DC2626' },
};

function getIcon(label: string): { name: string; color: string } {
    const key = label.toLowerCase().replace(/ /g, '_').split(' ')[0];
    return INTENTION_ICONS[key] || { name: 'star-outline', color: '#FF7A00' };
}

export const IntentionBadge: React.FC<IntentionBadgeProps> = ({ intention, onPress }) => {
    const icon = getIcon(intention.label);
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            className="flex-row items-center bg-orange-50 border border-orange-200 rounded-full px-4 py-2.5 mr-3 mb-2"
        >
            <Ionicons name={icon.name as any} size={15} color={icon.color} style={{ marginRight: 6 }} />
            <Text className="text-sm font-semibold text-gray-800 mr-1.5">{intention.label}</Text>
            <View className="bg-orange-500 rounded-full px-2 py-0.5 min-w-[24px] items-center">
                <Text className="text-[11px] font-bold text-white">{intention.activeCount}</Text>
            </View>
        </TouchableOpacity>
    );
};
