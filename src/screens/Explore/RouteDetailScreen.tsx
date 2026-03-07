import React from 'react';
import { View, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_PLACES } from '../../data/mockData';

export const RouteDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const { socialRoute } = route.params;

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero */}
                <ImageBackground
                    source={{ uri: socialRoute.imageUrl }}
                    className="w-full h-[240px] justify-end"
                >
                    <View className="bg-black/40 px-5 pb-5 pt-16">
                        <View className="flex-row items-center gap-2 mb-2">
                            <View className="bg-white/20 px-3 py-1 rounded-full">
                                <Text className="text-white text-[11px] font-bold">
                                    🗺️ {socialRoute.placesCount} lugares
                                </Text>
                            </View>
                            <View className="bg-green-500/80 px-3 py-1 rounded-full">
                                <Text className="text-white text-[11px] font-bold">
                                    {socialRoute.activeGroups} grupos ativos
                                </Text>
                            </View>
                        </View>
                        <Text className="text-white text-2xl font-bold">
                            {socialRoute.title}
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

                {/* Description */}
                <View className="px-5 py-5 border-b border-gray-100">
                    <Text className="text-sm text-gray-500 leading-5">
                        Uma rota curada com os melhores pontos da cidade. Explore cada lugar e compartilhe sua experiência com outros grupos.
                    </Text>
                </View>

                {/* Places */}
                <View className="px-5 pt-5 pb-2">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Lugares da rota</Text>
                    {Array.from({ length: socialRoute.placesCount }).map((_, i) => {
                        const placeMock = MOCK_PLACES[i % MOCK_PLACES.length];
                        return (
                            <TouchableOpacity
                                key={i}
                                className="flex-row items-center mb-4"
                                onPress={() => navigation.navigate('PlaceDetail', { place: placeMock })}
                                activeOpacity={0.7}
                            >
                                <View className="w-9 h-9 rounded-full bg-gray-900 items-center justify-center mr-3">
                                    <Text className="text-white text-[13px] font-bold">{i + 1}</Text>
                                </View>
                                <View className="flex-1 border-b border-gray-100 pb-3">
                                    <Text className="text-[14px] font-semibold text-gray-800">
                                        {['Café Central', 'Parque do Lago', 'Mirante da Serra', 'Bar do Porto', 'Praça da Liberdade'][i % 5]}
                                    </Text>
                                    <Text className="text-[12px] text-gray-400 mt-0.5">
                                        {['Café artesanal', 'Parque urbano', 'Vista panorâmica', 'Drinks e petiscos', 'Ponto de encontro'][i % 5]}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                            </TouchableOpacity>
                        )
                    })}
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
                    <Text className="text-base font-bold text-white">Iniciar rota</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
