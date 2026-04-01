import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from '@/src/components/ui/text';
import {
    COLOR_CATEGORIES,
    COLOR_LABELS,
    READABLE_LABELS,
    getOutfitLabel,
} from "@/src/utils/avatarConfig";

interface AvatarOptionRowProps {
    category: string;
    options: readonly string[];
    selectedValue: string | undefined;
    onSelect: (category: string, value: string) => void;
    /** Current avatar gender — needed to show correct outfit label */
    gender?: '1' | '2';
}

export const AvatarOptionRow: React.FC<AvatarOptionRowProps> = ({
    category,
    options,
    selectedValue,
    onSelect,
    gender = '1',
}) => {
    const isColor = COLOR_CATEGORIES.has(category);

    if (isColor) {
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 14, paddingVertical: 12 }}
            >
                {options.map((opt, index) => {
                    const isSelected = selectedValue === opt;
                    const colorInfo = COLOR_LABELS[opt];
                    const swatchColor = colorInfo?.hex ?? (opt.length === 6 ? `#${opt}` : '#E5E7EB');

                    return (
                        <TouchableOpacity
                            key={opt}
                            onPress={() => onSelect(category, opt)}
                            className="items-center gap-1.5"
                        >
                            <View
                                className={`w-11 h-11 rounded-full border-[2.5px] ${isSelected ? 'border-orange-500' : 'border-gray-200'}`}
                                style={{ backgroundColor: swatchColor }}
                            />
                            <Text className={`text-[10px] ${isSelected ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>
                                {colorInfo?.name ?? `Opção ${index + 1}`}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        );
    }

    return (
        <View className="flex-row flex-wrap px-4 py-3 gap-2">
            {options.map((opt) => {
                const isSelected = selectedValue === opt;

                // For outfit, use gender-aware label
                const label = category === 'outfit'
                    ? getOutfitLabel(opt, gender)
                    : (READABLE_LABELS[category]?.[opt] ?? opt);

                return (
                    <TouchableOpacity
                        key={opt}
                        onPress={() => onSelect(category, opt)}
                        className={`px-4 py-2.5 rounded-xl border ${isSelected
                                ? 'bg-orange-50 border-orange-500'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                    >
                        <Text className={`text-[13px] ${isSelected ? 'font-bold text-orange-600' : 'text-gray-600'}`}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};