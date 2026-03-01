import React from 'react';
import { View, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '../config/theme';
import { Text } from '@/src/components/ui/text';
import { WayMeetEvent } from '../types';
import { formatEventDateTime, formatPrice } from '../utils/helpers';

interface EventCardProps {
    event: WayMeetEvent;
    onPress: () => void;
    onJoin?: () => void;
    compact?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, onJoin, compact }) => {
    const compactWidth = (Dimensions.get('window').width - 48) / 2;

    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-card rounded-xl overflow-hidden mb-4"
            style={[Shadows.card, compact && { width: compactWidth }]}
            activeOpacity={0.85}
        >
            <ImageBackground
                source={{ uri: event.imageUrl }}
                className={`w-full justify-start items-end p-[10px] ${compact ? 'h-[120px]' : 'h-[160px]'}`}
                imageStyle={{ borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl }}
            >
                <View className="bg-black/50 px-[10px] py-1 rounded-xl">
                    <Text className="text-textInverse text-[11px] font-medium">{event.category}</Text>
                </View>
            </ImageBackground>

            <View className="p-[14px]">
                <Text className="text-base font-bold text-text mb-1.5" numberOfLines={1}>
                    {event.title}
                </Text>
                <View className="flex-row items-center gap-[5px] mb-[3px]">
                    <Ionicons name="calendar-outline" size={13} color={Colors.primary} />
                    <Text className="text-xs text-primary font-medium">
                        {formatEventDateTime(event.date, event.time)}
                    </Text>
                </View>
                <View className="flex-row items-center gap-[3px] mb-2">
                    <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                    <Text className="text-xs text-textSecondary flex-1" numberOfLines={1}>
                        {event.locationName}
                    </Text>
                </View>
                <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-bold text-primary">
                        {formatPrice(event.price)}
                    </Text>
                    <View className="flex-row items-center gap-1">
                        <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
                        <Text className="text-xs text-textSecondary">
                            {event.attendees.length}/{event.maxParticipants}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};