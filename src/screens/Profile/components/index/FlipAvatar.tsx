import React, { useRef, useState, useMemo } from 'react';
import { View, TouchableOpacity, ImageBackground, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Shadows, Colors } from '@/src/config/theme';
import { buildBitmojiUrl, parseConfig, COLOR_LABELS } from '@/src/utils/avatarConfig';

interface FlipAvatarProps {
    avatarUrl: string; // The photo avatar
    bitmojiConfig: string; // The serialized bitmoji config
}

export const FlipAvatar: React.FC<FlipAvatarProps> = ({ avatarUrl, bitmojiConfig }) => {
    const [showingBitmoji, setShowingBitmoji] = useState(false);
    const flipAnim = useRef(new Animated.Value(0)).current;

    const bitmojiUrl = useMemo(() => {
        if (!bitmojiConfig) return null;
        try {
            const config = parseConfig(bitmojiConfig);
            return buildBitmojiUrl(config);
        } catch (e) {
            return null;
        }
    }, [bitmojiConfig]);

    const frontInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });
    const backInterpolate = flipAnim.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });
    const frontOpacity = flipAnim.interpolate({
        inputRange: [89, 90],
        outputRange: [1, 0],
    });
    const backOpacity = flipAnim.interpolate({
        inputRange: [89, 90],
        outputRange: [0, 1],
    });

    const handleFlip = () => {
        Animated.spring(flipAnim, {
            toValue: showingBitmoji ? 0 : 180,
            friction: 8,
            tension: 10,
            useNativeDriver: true,
        }).start();
        setShowingBitmoji(!showingBitmoji);
    };

    return (
        <TouchableOpacity onPress={handleFlip} activeOpacity={1}>
            <View style={{ width: 90, height: 90 }}>
                <Animated.View
                    style={{
                        position: 'absolute',
                        width: 90, height: 90,
                        borderRadius: 45,
                        backfaceVisibility: 'hidden',
                        transform: [{ perspective: 800 }, { rotateY: frontInterpolate }],
                        opacity: frontOpacity,
                        overflow: 'hidden',
                        borderWidth: 4,
                        borderColor: 'white',
                        ...Shadows.medium,
                    }}
                >
                    <ImageBackground
                        source={{ uri: avatarUrl || 'https://via.placeholder.com/100' }}
                        style={{ width: '100%', height: '100%', backgroundColor: '#F3F4F6' }}
                        imageStyle={{ borderRadius: 45 }}
                    />
                </Animated.View>

                <Animated.View
                    style={{
                        position: 'absolute',
                        width: 90, height: 90,
                        borderRadius: 45,
                        backfaceVisibility: 'hidden',
                        transform: [{ perspective: 800 }, { rotateY: backInterpolate }],
                        opacity: backOpacity,
                        overflow: 'hidden',
                        borderWidth: 4,
                        borderColor: '#FED7AA',
                        backgroundColor: COLOR_LABELS[parseConfig(bitmojiConfig).backgroundColor]?.hex || parseConfig(bitmojiConfig).backgroundColor || '#FFF7ED',
                        ...Shadows.medium,
                    }}
                >
                    {bitmojiUrl ? (
                        <Image
                            source={{ uri: bitmojiUrl }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="contain"
                        />
                    ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="person" size={40} color="#D1D5DB" />
                        </View>
                    )}
                </Animated.View>
            </View>
        </TouchableOpacity>
    );
};