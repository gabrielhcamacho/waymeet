import React from "react";
import { View } from "react-native";
import { Text } from "@/src/components/ui/text";
import { Input, InputField } from "@/src/components/ui/input";

interface TextFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    multiline?: boolean;
    height?: number;
};

export const TextField: React.FC<TextFieldProps> = ({ label, placeholder, value, onChangeText, multiline = false, height }) => (
    <View className="mb-5">
        <Text className="text-sm font-semibold text-text mb-2">{label}</Text>
        <Input
            variant="outline"
            size="xl"
            className="rounded-lg border-border flex-row items-center"
            style={height ? { height } : undefined}
        >
            <InputField
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                className="flex-1 text-[15px] text-text px-[14px] py-3"
                style={multiline ? { textAlignVertical: 'top' } : undefined}
            />
        </Input>
    </View>
)