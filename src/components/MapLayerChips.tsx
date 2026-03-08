import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { MapLayer } from '../types';

interface LayerConfig {
    key: MapLayer;
    label: string;
    color: string;
}

const LAYERS: LayerConfig[] = [
    { key: 'eventos', label: 'Encontros', color: '#ff5028' },
    { key: 'pessoas', label: 'Pessoas', color: '#4682ff' },
    { key: 'lugares', label: 'Lugares', color: '#28c878' },
    { key: 'rotas', label: 'Rotas', color: '#9ca3af' },
];

interface MapLayerChipsProps {
    activeLayers: MapLayer[];
    onToggle: (layer: MapLayer) => void;
    counts: Record<string, number>;
}

export const MapLayerChips: React.FC<MapLayerChipsProps> = ({ activeLayers, onToggle, counts }) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
            <View className="flex-row items-center rounded-full p-1.5 shadow-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}>
                {LAYERS.map(({ key, label, color }) => {
                    const isActive = activeLayers.includes(key);
                    const count = counts[key] || 0;

                    // Hex to RGB for semitransparent bg logic could be complex without a lib, 
                    // so we can use an inline style trick or just simple opacity if color is hex
                    const rgbaBg = isActive ? `${color}25` : 'transparent';
                    const borderColor = isActive ? color : 'transparent';
                    const textColor = isActive ? color : '#4B5563';
                    const dotColor = isActive ? color : '#9CA3AF';

                    return (
                        <TouchableOpacity
                            key={key}
                            onPress={() => onToggle(key)}
                            activeOpacity={0.7}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: rgbaBg,
                                borderColor: borderColor,
                                borderWidth: 1,
                                borderRadius: 100,
                                paddingVertical: 8,
                                paddingHorizontal: 14,
                                marginRight: 4,
                            }}
                        >
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dotColor, marginRight: 6 }} />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: textColor }}>
                                {label} {count > 0 && <Text style={{ fontSize: 12, opacity: 0.7 }}>· {count}</Text>}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );
};
