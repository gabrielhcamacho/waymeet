import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Text } from '@/src/components/ui/text';
import { Colors } from '../../../../config/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface AvatarPreviewProps {
    avatarUrl: string | null;
    backgroundColor?: string;
    isZoomed?: boolean;
    onRandomize: () => void;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({ avatarUrl, backgroundColor, isZoomed, onRandomize }) => {
    // backgroundColor might already have a '#' from COLOR_LABELS
    const bgColor = backgroundColor
        ? (backgroundColor.startsWith('#') ? backgroundColor : `#${backgroundColor}`)
        : '#dbeafe';

    const zoomAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(zoomAnim, {
            toValue: isZoomed ? 1 : 0,
            duration: 350,
            useNativeDriver: true,
        }).start();
    }, [isZoomed]);

    const scale = zoomAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2.8]
    });

    const translateY = zoomAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 70]
    });

    return (
        <View className="items-center mb-4">
            <View
                className="rounded-3xl items-center justify-center overflow-hidden"
                style={{
                    width: SCREEN_WIDTH - 40,
                    height: 240,
                    backgroundColor: bgColor,
                }}
            >
                {avatarUrl ? (
                    <Animated.View style={{ width: '85%', height: '95%', transform: [{ scale }, { translateY }] }}>
                        <Image
                            source={{ uri: avatarUrl }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="contain"
                        />
                    </Animated.View>
                ) : (
                    <Ionicons name="person" size={80} color={Colors.text} style={{ opacity: 0.15 }} />
                )}
            </View>

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onRandomize}
                className="flex-row items-center bg-orange-50 px-5 py-2.5 rounded-full border border-orange-200 mt-4"
            >
                <Ionicons name="dice-outline" size={20} color={Colors.primary} />
                <Text className="text-primary font-semibold ml-2">Aleatório</Text>
            </TouchableOpacity>
        </View>
    );
};