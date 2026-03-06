import React from 'react';
import { View, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { MicroCommunity } from '../types';

interface CommunityCardProps {
    community: MicroCommunity;
    onPress?: () => void;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ community, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className="w-[200px] bg-white rounded-2xl overflow-hidden mr-4"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            <ImageBackground
                source={{ uri: community.imageUrl }}
                className="w-full h-[110px] justify-end"
                imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            >
                <View className="bg-black/30 px-3 py-1.5 self-start ml-2.5 mb-2.5 rounded-full">
                    <Text className="text-white text-[11px] font-semibold">{community.emoji} {community.name}</Text>
                </View>
            </ImageBackground>

            <View className="px-3.5 py-3">
                <Text className="text-[12px] text-gray-500 mb-1.5" numberOfLines={1}>
                    {community.description}
                </Text>
                <View className="flex-row items-center gap-1">
                    <Ionicons name="people-outline" size={13} color="#9CA3AF" />
                    <Text className="text-[12px] text-gray-400 font-medium">
                        {community.memberCount} membros
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};
