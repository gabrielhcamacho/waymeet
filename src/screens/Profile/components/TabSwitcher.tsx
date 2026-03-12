import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

interface TabSwitcherProps {
    activeTab: "info" | "avatar";
    onTabChange: (tab: 'info' | 'avatar') => void;
};

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ activeTab, onTabChange }) => (
    <View className="flex-row mb-2 bg-gray-100 p-1 rounded-xl">
        {(['info', 'avatar'] as const).map((tab) => {
            const label = tab === 'info' ? 'Informações' : 'Avatar';
            const isActive = activeTab === tab;
            return (
                <TouchableOpacity
                    key={tab}
                    className={`flex-1 py-2 items-center rounded-lg ${isActive ? 'bg-white shadow-sm' : ''}`}
                    onPress={() => onTabChange(tab)}
                >
                    <Text
                        style={{
                            fontWeight: '600',
                            color: isActive ? '#111827' : '#6B7280',
                        }}
                    >
                        {label}
                    </Text>
                </TouchableOpacity>
            );
        })}
    </View>
);