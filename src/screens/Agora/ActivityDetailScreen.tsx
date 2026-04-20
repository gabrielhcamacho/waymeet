import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NearbyActivity } from '../../types';

export const ActivityDetailScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const { activity } = route.params as { activity: NearbyActivity };

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-5 pt-4" style={{ paddingTop: insets.top + 8 }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-4"
                    >
                        <Ionicons name="arrow-back" size={20} color="#1F2937" />
                    </TouchableOpacity>
                </View>

                {/* Icon hero */}
                <View className="items-center mb-6">
                    <View className="w-24 h-24 rounded-3xl bg-orange-50 items-center justify-center mb-4">
                        <Ionicons name={activity.iconName as any} size={44} color="#FF7A00" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">{activity.label}</Text>
                    {activity.locationName && (
                        <View className="flex-row items-center mt-2 gap-1">
                            <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                            <Text className="text-sm text-gray-400">{activity.locationName}</Text>
                        </View>
                    )}
                </View>

                {/* Stats */}
                <View className="flex-row mx-5 bg-gray-50 rounded-2xl p-4 mb-6">
                    <View className="flex-1 items-center">
                        <Text className="text-2xl font-bold text-gray-900">{activity.peopleCount}</Text>
                        <Text className="text-[12px] text-gray-400 mt-0.5">pessoas</Text>
                    </View>
                    <View className="w-px bg-gray-200" />
                    <View className="flex-1 items-center">
                        <Text className="text-2xl font-bold text-gray-900">{activity.distance}</Text>
                        <Text className="text-[12px] text-gray-400 mt-0.5">de distância</Text>
                    </View>
                    <View className="w-px bg-gray-200" />
                    <View className="flex-1 items-center">
                        <View className={`px-2 py-0.5 rounded-full ${activity.time === 'agora' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            <Text className={`text-sm font-bold ${activity.time === 'agora' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {activity.time}
                            </Text>
                        </View>
                        <Text className="text-[12px] text-gray-400 mt-0.5">quando</Text>
                    </View>
                </View>

                {/* Participants preview */}
                <View className="px-5 mb-6">
                    <Text className="text-sm font-bold text-gray-900 mb-3">Quem está participando</Text>
                    <View className="flex-row gap-3">
                        {Array.from({ length: Math.min(activity.peopleCount, 5) }).map((_, i) => (
                            <View key={i} className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center">
                                <User size={20} color="#9CA3AF" strokeWidth={1.5} />
                            </View>
                        ))}
                        {activity.peopleCount > 5 && (
                            <View className="w-11 h-11 rounded-full bg-gray-50 items-center justify-center">
                                <Text className="text-[11px] text-gray-400 font-bold">+{activity.peopleCount - 5}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Info */}
                <View className="px-5 mb-6">
                    <Text className="text-sm font-bold text-gray-900 mb-2">Sobre a atividade</Text>
                    <Text className="text-sm text-gray-500 leading-5">
                        {activity.peopleCount} pessoas estão {activity.time === 'agora' ? 'praticando' : 'planejando'} {activity.label.toLowerCase()} {activity.locationName ? `em ${activity.locationName}` : 'perto de você'}. Toque em participar para entrar e conectar-se com o grupo.
                    </Text>
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
                    <Ionicons name="hand-right" size={18} color="white" />
                    <Text className="text-base font-bold text-white">Participar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
