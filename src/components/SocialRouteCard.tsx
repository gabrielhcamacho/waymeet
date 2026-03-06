import React from 'react';
import { View, TouchableOpacity, ImageBackground } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { SocialRoute } from '../types';

interface SocialRouteCardProps {
    route: SocialRoute;
    onPress?: () => void;
}

export const SocialRouteCard: React.FC<SocialRouteCardProps> = ({ route, onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className="w-[260px] bg-white rounded-2xl overflow-hidden mr-4"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
                elevation: 3,
            }}
        >
            {/* Image */}
            <ImageBackground
                source={{ uri: route.imageUrl }}
                className="w-full h-[130px] justify-end"
                imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
            >
                <View className="bg-black/40 rounded-full px-2.5 py-1 self-start ml-3 mb-3 flex-row items-center gap-1">
                    <Ionicons name="people" size={12} color="white" />
                    <Text className="text-[11px] text-white font-semibold">
                        {route.activeGroups} grupos · {route.activeParticipants} agora
                    </Text>
                </View>
            </ImageBackground>

            {/* Content */}
            <View className="px-4 py-3">
                <Text className="text-[15px] font-bold text-gray-900 mb-1" numberOfLines={1}>
                    {route.title}
                </Text>
                <View className="flex-row items-center gap-1.5">
                    <Ionicons name="navigate-outline" size={13} color="#9CA3AF" />
                    <Text className="text-[12px] text-gray-400 font-medium">
                        {route.placesCount} lugares
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};
