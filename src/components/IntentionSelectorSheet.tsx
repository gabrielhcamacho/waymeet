import React from 'react';
import { View, TouchableOpacity, Modal } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIntentionStore } from '../store/useIntentionStore';
import { SocialIntention } from '../types';

const INTENTION_OPTIONS: { emoji: string; label: string; id: string }[] = [
    { id: '1', emoji: '☕', label: 'Café agora' },
    { id: '2', emoji: '🍻', label: 'Drinks' },
    { id: '3', emoji: '⚽', label: 'Esporte' },
    { id: '4', emoji: '🚶', label: 'Explorar' },
    { id: '5', emoji: '🎵', label: 'Música ao vivo' },
    { id: '6', emoji: '🧘', label: 'Yoga / Bem-estar' },
    { id: '7', emoji: '💻', label: 'Trabalhar em café' },
    { id: '8', emoji: '🫂', label: 'Não quero ficar sozinho' },
];

interface IntentionSelectorSheetProps {
    visible: boolean;
    onClose: () => void;
}

export const IntentionSelectorSheet: React.FC<IntentionSelectorSheetProps> = ({
    visible,
    onClose,
}) => {
    const insets = useSafeAreaInsets();
    const { activeIntention, setIntention, clearIntention } = useIntentionStore();

    const handleSelect = (option: typeof INTENTION_OPTIONS[number]) => {
        const intention: SocialIntention = {
            id: option.id,
            emoji: option.emoji,
            label: option.label.toLowerCase(),
            activeCount: Math.floor(Math.random() * 15) + 1,
        };
        setIntention(intention);
        onClose();
    };

    const handleClear = () => {
        clearIntention();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/40">
                <View
                    className="bg-white rounded-t-3xl"
                    style={{ paddingBottom: insets.bottom + 16 }}
                >
                    {/* Handle */}
                    <View className="items-center pt-3 pb-1">
                        <View className="w-10 h-1 bg-gray-300 rounded-full" />
                    </View>

                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 py-4">
                        <Text className="text-xl font-bold text-gray-900">
                            O que você quer fazer?
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-[13px] text-gray-400 px-6 mb-4">
                        Outras pessoas com a mesma intenção vão te encontrar. Expira em 2h.
                    </Text>

                    {/* Options Grid */}
                    <View className="px-6 flex-row flex-wrap gap-3 mb-4">
                        {INTENTION_OPTIONS.map((option) => {
                            const isActive = activeIntention?.id === option.id;
                            return (
                                <TouchableOpacity
                                    key={option.id}
                                    onPress={() => handleSelect(option)}
                                    activeOpacity={0.7}
                                    className={`w-[47%] flex-row items-center px-4 py-4 rounded-2xl border-2 gap-3 ${isActive
                                            ? 'bg-orange-50 border-orange-500'
                                            : 'bg-gray-50 border-transparent'
                                        }`}
                                >
                                    <Text className="text-2xl">{option.emoji}</Text>
                                    <Text
                                        className={`text-[13px] font-semibold flex-1 ${isActive ? 'text-orange-600' : 'text-gray-700'
                                            }`}
                                        numberOfLines={1}
                                    >
                                        {option.label}
                                    </Text>
                                    {isActive && (
                                        <Ionicons name="checkmark-circle" size={18} color="#FF7A00" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Clear Button */}
                    {activeIntention && (
                        <TouchableOpacity
                            onPress={handleClear}
                            className="mx-6 py-3 items-center"
                        >
                            <Text className="text-sm font-medium text-gray-400">
                                Limpar intenção
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};
