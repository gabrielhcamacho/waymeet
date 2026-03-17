import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { SectionHeader } from '@/src/components/SectionHeader';

const INTEREST_EMOJIS: Record<string, string> = {
    '1': '👨‍👩‍👧‍👦', '2': '💑', '3': '👫', '4': '🏔️', '5': '🏛️',
    '6': '🎭', '7': '🌾', '8': '☀️', '9': '⚽', '10': '🎵',
    '11': '🌿', '12': '🍽️', '13': '🎉', '14': '💼',
};

const INTEREST_NAMES: Record<string, string> = {
    '1': 'Family', '2': 'Romance', '3': 'Friends', '4': 'Aventura', '5': 'Histórico',
    '6': 'Cultural', '7': 'Rural', '8': 'Verão', '9': 'Esportes', '10': 'Música',
    '11': 'Ecotour', '12': 'Gastronomia', '13': 'Encontros', '14': 'Business',
};

interface ProfileInterestsProps {
    selectedCategories: string[];
}

export const ProfileInterests: React.FC<ProfileInterestsProps> = ({ selectedCategories }) => (
    <View className="mt-6">
        <SectionHeader title="Interesses" />
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
        >
            {selectedCategories.map((catId) => (
                <View
                    key={catId}
                    className="flex-row items-center bg-orange-50 border border-orange-200 rounded-full px-4 py-2 mr-2"
                >
                    <Text className="text-sm mr-1">{INTEREST_EMOJIS[catId] || '📍'}</Text>
                    <Text className="text-[13px] font-medium text-orange-700">
                        {INTEREST_NAMES[catId] || catId}
                    </Text>
                </View>
            ))}
        </ScrollView>
    </View>
);