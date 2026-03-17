import React from "react";
import { View } from "react-native";
import { Button, ButtonText } from "@/src/components/ui/button";

interface TabSwitcherProps {
    activeTab: "info" | "avatar";
    onTabChange: (tab: 'info' | 'avatar') => void;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ activeTab, onTabChange }) => (
    <View className="flex-row mb-2 bg-gray-100 p-1 rounded-xl gap-1">
        {(['info', 'avatar'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === 'info' ? 'Informações' : 'Avatar';
            return (
                <Button
                    key={tab}
                    onPress={() => onTabChange(tab)}
                    className={`flex-1 rounded-lg h-9 ${isActive ? 'bg-white' : 'bg-transparent'}`}
                    variant="solid"
                >
                    <ButtonText
                        className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-500'}`}
                    >
                        {label}
                    </ButtonText>
                </Button>
            );
        })}
    </View>
);