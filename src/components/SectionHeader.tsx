import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';

interface SectionHeaderProps {
    title: string;
    onSeeMore?: () => void;
    seeMoreText?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    onSeeMore,
    seeMoreText = 'Ver mais',
}) => {
    return (
        <View className="flex-row justify-between items-center px-5 mb-3">
            <Text className="text-lg font-bold text-gray-900">{title}</Text>
            {onSeeMore && (
                <TouchableOpacity onPress={onSeeMore} activeOpacity={0.7}>
                    <Text className="text-[13px] text-orange-500 font-semibold">{seeMoreText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};
