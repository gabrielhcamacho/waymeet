import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text } from '@/src/components/ui/text';
import { Colors } from '../../../../config/theme';

interface AvatarPreviewProps {
    dicebearUrl: string | null;
    onRandomize: () => void;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({ dicebearUrl, onRandomize }) => (
    <View className="items-center mb-6">
        <View className="w-[120px] h-[120px] rounded-full bg-gray-100 items-center justify-center overflow-hidden border-[3px] border-orange-100">
            {dicebearUrl ? (
                <Image
                    source={{ uri: dicebearUrl }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="contain"
                />
            ) : (
                <Ionicons name="person" size={50} color={Colors.text} style={{ opacity: 0.3 }} />
            )}
        </View>

        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRandomize}
            className="flex-row items-center bg-orange-50 px-5 py-2.5 rounded-full border border-orange-200 mt-5"
        >
            <Ionicons name="dice-outline" size={20} color={Colors.primary} />
            <Text className="text-primary font-semibold ml-2">Aleatório</Text>
        </TouchableOpacity>
    </View>
);