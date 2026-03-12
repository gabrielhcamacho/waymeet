import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/src/components/ui/text';

const OPTION_LABELS: Record<string, string> = {
    top: 'Cabelo',
    hairColor: 'Cor do Cabelo',
    eyes: 'Olhos',
    mouth: 'Boca',
    skinColor: 'Tom de Pele',
    clothes: 'Roupas',
};

interface AvatarOptionRowProps {
    category: string;
    options: readonly string[];
    selectedValue: string | undefined;
    onSelect: (category: string, value: string) => void;
}

export const AvatarOptionRow: React.FC<AvatarOptionRowProps> = ({
    category,
    options,
    selectedValue,
    onSelect,
}) => (
    <View className="mb-6">
        <Text className="text-sm font-semibold text-text mb-3 px-1">
            {OPTION_LABELS[category] ?? category}
        </Text>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4 }}
        >
            {options.map((opt) => {
                const isSelected = selectedValue === opt;
                return (
                    <TouchableOpacity
                        key={opt}
                        onPress={() => onSelect(category, opt)}
                        className={`mr-3 px-4 py-2 rounded-lg border ${isSelected
                                ? 'bg-orange-50 border-orange-500'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                    >
                        <Text
                            className={`text-[13px] ${isSelected ? 'font-semibold text-orange-600' : 'text-gray-600'
                                }`}
                        >
                            {opt}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    </View>
);