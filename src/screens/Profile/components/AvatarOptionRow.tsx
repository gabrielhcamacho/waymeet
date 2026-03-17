import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/src/components/ui/text';
import {
    CATEGORY_LABELS,
    COLOR_CATEGORIES,
    COLOR_LABELS,
    READABLE_LABELS,
} from "@/src/utils/avatarConfig";

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
}) => {

    const isColor = COLOR_CATEGORIES.has(category);

    return (
        <View className="mb-6">
            <Text className="text-sm font-semibold text-text mb-3 px-1">
                {CATEGORY_LABELS[category] ?? category}
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4, gap: 10 }}
            >
                {options.map((opt) => {
                    const isSelected = selectedValue === opt;

                    if (isColor) {
                        const colorInfo = COLOR_LABELS[opt];
                        return (
                            <TouchableOpacity
                                key={opt}
                                onPress={() => onSelect(category, opt)}
                                className="items-center gap-1"
                            >
                                <View
                                    className={`w-9 h-9 rounded-full border-2 ${isSelected ? 'border-orange-500' : 'border-gray-200'}`}
                                    style={{ backgroundColor: colorInfo?.hex ?? `#${opt}` }}
                                />
                                <Text className={`text-[10px] ${isSelected ? 'text-orange-600 font-semibold' : 'text-gray-400'}`}>
                                    {colorInfo?.name ?? opt}
                                </Text>
                            </TouchableOpacity>
                        );
                    }

                    const label = READABLE_LABELS[category]?.[opt] ?? opt;
                    return (
                        <TouchableOpacity
                            key={opt}
                            onPress={() => onSelect(category, opt)}
                            className={`px-4 py-2 rounded-lg border ${isSelected
                                ? 'bg-orange-50 border-orange-500'
                                : 'bg-gray-50 border-gray-200'
                                }`}
                        >
                            <Text className={`text-[13px] ${isSelected ? 'font-semibold text-orange-600' : 'text-gray-600'}`}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};