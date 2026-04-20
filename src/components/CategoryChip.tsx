import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../config/theme';
import { Text } from '@/src/components/ui/text';

interface CategoryChipProps {
    label: string;
    icon: string;
    selected: boolean;
    onPress: () => void;
    style?: ViewStyle;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
    label,
    icon,
    selected,
    onPress,
    style,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.chip,
                selected ? styles.chipSelected : styles.chipUnselected,
                style,
            ]}
            activeOpacity={0.7}
            accessibilityLabel={`${label} category${selected ? ', selected' : ''}`}
            accessibilityRole="button"
        >
            <Ionicons name={icon as any} size={20} color={selected ? Colors.textInverse : Colors.text} />
            <Text
                style={[
                    styles.label,
                    selected ? styles.labelSelected : styles.labelUnselected,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        gap: 8,
        minWidth: 130,
    },
    chipSelected: {
        backgroundColor: Colors.chipSelectedBackground,
        borderWidth: 1.5,
        borderColor: Colors.chipSelectedBackground,
    },
    chipUnselected: {
        backgroundColor: Colors.background,
        borderWidth: 1.5,
        borderColor: Colors.border,
        ...Shadows.subtle,
    },

    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    labelSelected: {
        color: Colors.textInverse,
    },
    labelUnselected: {
        color: Colors.text,
    },
});
