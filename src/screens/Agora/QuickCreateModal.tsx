import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEventsStore } from '../../store/useEventsStore';
import { MOCK_USERS } from '../../data/mockData';

const ACTIVITIES = [
    { id: '1', emoji: '☕', label: 'Café', category: 'Gastronomic' },
    { id: '2', emoji: '🍻', label: 'Drinks', category: 'Gastronomic' },
    { id: '3', emoji: '⚽', label: 'Esporte', category: 'Sports' },
    { id: '4', emoji: '🚶', label: 'Explorar', category: 'Adventures' },
    { id: '5', emoji: '🎵', label: 'Música', category: 'Musical' },
    { id: '6', emoji: '🧘', label: 'Yoga', category: 'Sports' },
    { id: '7', emoji: '🍽️', label: 'Comer', category: 'Gastronomic' },
    { id: '8', emoji: '📚', label: 'Estudar', category: 'Cultural' },
];

const RADIUS_OPTIONS = [
    { label: '1 km', value: 1 },
    { label: '3 km', value: 3 },
    { label: '5 km', value: 5 },
    { label: '10 km', value: 10 },
];

export const QuickCreateModal: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { createEvent } = useEventsStore();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
    const [selectedRadius, setSelectedRadius] = useState<number>(3);

    const handlePublish = () => {
        const activity = ACTIVITIES.find((a) => a.id === selectedActivity);
        if (!activity) return;

        createEvent({
            title: `${activity.emoji} ${activity.label} agora`,
            description: `Atividade efêmera · Raio de ${selectedRadius}km · Expira em 2h`,
            imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop',
            category: activity.category,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            latitude: -23.3045 + (Math.random() - 0.5) * 0.01,
            longitude: -51.1696 + (Math.random() - 0.5) * 0.01,
            locationName: 'Perto de você',
            creatorId: MOCK_USERS[0].id,
            maxParticipants: 10,
            price: 0,
            isPublic: true,
            isEphemeral: true,
        });

        navigation.goBack();
    };

    return (
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => step === 2 ? setStep(1) : navigation.goBack()}>
                    <Ionicons
                        name={step === 2 ? 'arrow-back' : 'close'}
                        size={24}
                        color="#1A1A2E"
                    />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">
                    {step === 1 ? 'O que quer fazer?' : 'Qual o alcance?'}
                </Text>
                <View className="w-6" />
            </View>

            {/* Step indicator */}
            <View className="flex-row px-6 pt-4 gap-2">
                <View className="flex-1 h-1 rounded-full bg-orange-500" />
                <View className={`flex-1 h-1 rounded-full ${step === 2 ? 'bg-orange-500' : 'bg-gray-200'}`} />
            </View>

            {step === 1 ? (
                /* Step 1: Select Activity */
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <View className="flex-row flex-wrap gap-4">
                        {ACTIVITIES.map((activity) => {
                            const isSelected = selectedActivity === activity.id;
                            return (
                                <TouchableOpacity
                                    key={activity.id}
                                    onPress={() => setSelectedActivity(activity.id)}
                                    activeOpacity={0.7}
                                    className={`w-[45%] items-center py-6 rounded-2xl border-2 ${isSelected
                                            ? 'bg-orange-50 border-orange-500'
                                            : 'bg-gray-50 border-transparent'
                                        }`}
                                >
                                    <Text className="text-3xl mb-2">{activity.emoji}</Text>
                                    <Text
                                        className={`text-[15px] font-semibold ${isSelected ? 'text-orange-600' : 'text-gray-700'
                                            }`}
                                    >
                                        {activity.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </ScrollView>
            ) : (
                /* Step 2: Select Radius */
                <View className="flex-1 px-5 pt-8">
                    <Text className="text-center text-gray-400 text-sm mb-8">
                        Pessoas em um raio de quanto vão ver sua atividade?
                    </Text>
                    <View className="gap-3">
                        {RADIUS_OPTIONS.map((option) => {
                            const isSelected = selectedRadius === option.value;
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    onPress={() => setSelectedRadius(option.value)}
                                    activeOpacity={0.7}
                                    className={`flex-row items-center justify-between px-6 py-5 rounded-2xl border-2 ${isSelected
                                            ? 'bg-orange-50 border-orange-500'
                                            : 'bg-gray-50 border-transparent'
                                        }`}
                                >
                                    <Text
                                        className={`text-lg font-bold ${isSelected ? 'text-orange-600' : 'text-gray-700'
                                            }`}
                                    >
                                        {option.label}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={24} color="#FF7A00" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            )}

            {/* Bottom Action */}
            <View className="px-5 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
                <TouchableOpacity
                    onPress={() => {
                        if (step === 1 && selectedActivity) {
                            setStep(2);
                        } else if (step === 2) {
                            handlePublish();
                        }
                    }}
                    disabled={step === 1 && !selectedActivity}
                    activeOpacity={0.85}
                    className={`rounded-2xl py-4 items-center ${(step === 1 && !selectedActivity)
                            ? 'bg-gray-200'
                            : 'bg-gray-900'
                        }`}
                    style={
                        (step === 1 && !selectedActivity)
                            ? undefined
                            : {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 12,
                                elevation: 6,
                            }
                    }
                >
                    <Text
                        className={`text-base font-bold ${(step === 1 && !selectedActivity) ? 'text-gray-400' : 'text-white'
                            }`}
                    >
                        {step === 1 ? 'Próximo' : '⚡ Publicar atividade'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
