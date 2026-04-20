import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { MicroCommunity } from '../types';

interface CommunityTagProps {
    community: MicroCommunity;
    onPress?: () => void;
}

export const CommunityTag: React.FC<CommunityTagProps> = ({ community, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-row items-center bg-white border border-gray-200 rounded-full px-4 py-2.5 mr-2.5 mb-2"
        >
            <Ionicons name="people-outline" size={13} color="#6B7280" style={{ marginRight: 6 }} />
            <Text className="text-[13px] font-semibold text-gray-700">{community.name}</Text>
            <Text className="text-[11px] text-gray-400 ml-2">{community.memberCount}</Text>
        </TouchableOpacity>
    );
};
