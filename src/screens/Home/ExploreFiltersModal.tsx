import React from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { CategoryChip } from '../../components/CategoryChip';
import { CATEGORIES } from '../../data/mockData';
import { useEventsStore } from '../../store/useEventsStore';
import Slider from '@react-native-community/slider';

export const ExploreFiltersModal: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { filters, setFilters, resetFilters, getFilteredEvents } = useEventsStore();

    const toggleCategory = (name: string) => {
        const cats = filters.categories.includes(name)
            ? filters.categories.filter((c) => c !== name)
            : [...filters.categories, name];
        setFilters({ categories: cats });
    };

    const filteredCount = getFilteredEvents().length;

    return (
        <View className="flex-1 bg-background rounded-tl-3xl rounded-tr-3xl px-5 pt-3">
            {/* Handle bar */}
            <View className="w-10 h-1 bg-border rounded-full self-center mb-4" />

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-2xl font-bold text-text">Filtros</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="close" size={24} color={Colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Categories */}
                <View className="mb-7">
                    <Text className="text-lg font-semibold text-text mb-[14px]">Categorias</Text>
                    <View className="flex-row flex-wrap gap-[10px]">
                        {CATEGORIES.map((cat) => (
                            <CategoryChip
                                key={cat.id}
                                label={cat.name}
                                icon={cat.icon}
                                selected={filters.categories.includes(cat.name)}
                                onPress={() => toggleCategory(cat.name)}
                                style={{ minWidth: 0 }}
                            />
                        ))}
                    </View>
                </View>

                {/* Price */}
                <View className="mb-7">
                    <Text className="text-lg font-semibold text-text mb-[14px]">Preço</Text>
                    <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-textSecondary font-medium min-w-[50px] text-center">R$ 0</Text>
                        <View className="flex-1">
                            <Slider
                                minimumValue={0}
                                maximumValue={10000}
                                step={50}
                                value={filters.priceMax}
                                onValueChange={(value) => setFilters({ priceMax: value })}
                                minimumTrackTintColor={Colors.primary}
                                maximumTrackTintColor={Colors.borderLight}
                                thumbTintColor={Colors.primary}
                            />
                        </View>
                        <Text className="text-xs text-textSecondary font-medium min-w-[50px] text-center">
                            {filters.priceMax >= 10000 ? '∞' : `R$ ${filters.priceMax}`}
                        </Text>
                    </View>
                    <View className="items-center mt-1">
                        <Text className="text-[13px] text-primary font-semibold">
                            Até {filters.priceMax >= 10000 ? 'sem limite' : `R$ ${filters.priceMax}`}
                        </Text>
                    </View>
                </View>

                {/* Distance */}
                <View className="mb-7">
                    <Text className="text-lg font-semibold text-text mb-[14px]">Distância</Text>
                    <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-textSecondary font-medium min-w-[50px] text-center">0 km</Text>
                        <View className="flex-1">
                            <Slider
                                minimumValue={0}
                                maximumValue={100}
                                step={5}
                                value={filters.distanceMax}
                                onValueChange={(value) => setFilters({ distanceMax: value })}
                                minimumTrackTintColor={Colors.primary}
                                maximumTrackTintColor={Colors.borderLight}
                                thumbTintColor={Colors.primary}
                            />
                        </View>
                        <Text className="text-xs text-textSecondary font-medium min-w-[50px] text-center">
                            {filters.distanceMax}+ km
                        </Text>
                    </View>
                    <View className="self-center bg-chipBackground px-4 py-[6px] rounded-2xl mt-2">
                        <Text className="text-[13px] font-semibold text-primary">
                            {filters.distanceMax} km
                        </Text>
                    </View>
                </View>

                {/* Results count */}
                <View className="items-center mb-5">
                    <Text className="text-[13px] text-textSecondary font-medium">
                        {filteredCount} resultados encontrados
                    </Text>
                </View>

                {/* Buttons */}
                <View className="flex-row gap-3 mb-10">
                    <TouchableOpacity
                        className="flex-1 py-4 rounded-xl border-[1.5px] border-border items-center"
                        onPress={resetFilters}
                        activeOpacity={0.7}
                    >
                        <Text className="text-base font-semibold text-text">Limpar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="flex-[2] py-4 rounded-xl bg-primary items-center"
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.85}
                    >
                        <Text className="text-base font-bold text-textInverse">Aplicar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};  