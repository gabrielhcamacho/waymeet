import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
    RadarTab: { active: 'radio', inactive: 'radio-outline' },
    MapTab: { active: 'map', inactive: 'map-outline' },
    AgoraTab: { active: 'flash', inactive: 'flash-outline' },
    ExploreTab: { active: 'compass', inactive: 'compass-outline' },
    ProfileTab: { active: 'person', inactive: 'person-outline' },
};

const TAB_LABELS: Record<string, string> = {
    RadarTab: 'Radar',
    MapTab: 'Mapa',
    AgoraTab: 'Agora',
    ExploreTab: 'Explorar',
    ProfileTab: 'Perfil',
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="flex-row bg-white pt-2 border-t border-gray-100"
            style={{
                paddingBottom: Math.max(insets.bottom, 8),
                ...Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 10,
                    },
                    android: {
                        elevation: 8,
                    },
                }),
            }}
        >
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const iconConfig = TAB_ICONS[route.name];
                const label = TAB_LABELS[route.name];

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={label}
                        onPress={onPress}
                        className="flex-1 items-center justify-center py-1"
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isFocused ? iconConfig.active : iconConfig.inactive}
                            size={22}
                            color={isFocused ? '#FF7A00' : '#9CA3AF'}
                        />
                        <Text
                            className={`text-[10px] mt-0.5 ${isFocused ? 'text-orange-500 font-semibold' : 'text-gray-400 font-medium'
                                }`}
                        >
                            {label}
                        </Text>
                        {isFocused && (
                            <View className="w-1 h-1 rounded-full bg-orange-500 mt-0.5" />
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
