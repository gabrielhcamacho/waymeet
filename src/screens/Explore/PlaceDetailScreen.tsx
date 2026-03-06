import React from 'react';
import { View, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Place } from '../../types';

export const PlaceDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const { place } = route.params as { place: Place };

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <ImageBackground
                    source={{ uri: place.imageUrl }}
                    className="w-full h-[260px] justify-end"
                >
                    <View className="bg-black/40 px-5 pb-5 pt-16">
                        <View className="flex-row items-center gap-1 mb-2">
                            <Ionicons name="star" size={14} color="#FBBF24" />
                            <Text className="text-white text-[13px] font-bold">{place.rating}</Text>
                            <Text className="text-white/60 text-[12px]"> · {place.category}</Text>
                        </View>
                        <Text className="text-white text-2xl font-bold">
                            {place.name}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="absolute left-5 bg-white/90 w-10 h-10 rounded-full items-center justify-center"
                        style={{ top: insets.top + 4 }}
                    >
                        <Ionicons name="arrow-back" size={20} color="#1F2937" />
                    </TouchableOpacity>
                </ImageBackground>

                {/* Info */}
                <View className="px-5 py-5 border-b border-gray-100">
                    <View className="flex-row items-center gap-2 mb-3">
                        <Ionicons name="location-outline" size={16} color="#9CA3AF" />
                        <Text className="text-sm text-gray-500">{place.address}</Text>
                    </View>
                    <Text className="text-sm text-gray-500 leading-5">
                        {place.description}
                    </Text>
                </View>

                {/* Tags */}
                <View className="px-5 py-4 border-b border-gray-100">
                    <Text className="text-sm font-bold text-gray-900 mb-3">Categorias</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {place.categoryIcons.map((icon, i) => (
                            <View key={i} className="bg-gray-50 px-3 py-1.5 rounded-full">
                                <Text className="text-sm">{icon}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View className="h-[120px]" />
            </ScrollView>

            {/* Bottom Action */}
            <View
                className="absolute bottom-0 left-0 right-0 px-5 pt-3 bg-white border-t border-gray-100"
                style={{ paddingBottom: insets.bottom + 12 }}
            >
                <TouchableOpacity
                    activeOpacity={0.85}
                    className="bg-gray-900 rounded-2xl py-4 items-center flex-row justify-center gap-2"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 12,
                        elevation: 6,
                    }}
                >
                    <Ionicons name="navigate" size={18} color="white" />
                    <Text className="text-base font-bold text-white">Como chegar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
