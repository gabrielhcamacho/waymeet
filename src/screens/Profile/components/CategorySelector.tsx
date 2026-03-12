import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { CATEGORIES } from '../../../data/mockData';

interface CategorySelectorProps {
    selectedCategories: string[];
    onToggle: (id: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
    selectedCategories,
    onToggle,
}) => (
    <View className="mb-5">
        <Text className="text-sm font-semibold text-text mb-3">Seus Interesses</Text>
        <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.id);
                return (
                    <TouchableOpacity
                        key={cat.id}
                        activeOpacity={0.7}
                        onPress={() => onToggle(cat.id)}
                        className={`flex-row items-center rounded-full px-4 py-2 border ${isSelected ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-200'
                            }`}
                    >
                        <Text className="text-sm mr-1.5">{cat.icon}</Text>
                        <Text
                            className={`text-[13px] font-semibold ${isSelected ? 'text-orange-600' : 'text-gray-500'
                                }`}
                        >
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    </View>
);