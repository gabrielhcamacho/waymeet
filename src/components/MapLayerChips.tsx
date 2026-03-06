import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/src/components/ui/text';
import { MapLayer } from '../types';

const LAYERS: { key: MapLayer; label: string; icon: string }[] = [
    { key: 'eventos', label: 'Encontros', icon: '🟠' },
    { key: 'pessoas', label: 'Pessoas', icon: '🔵' },
    { key: 'lugares', label: 'Lugares', icon: '🟢' },
    { key: 'rotas', label: 'Rotas', icon: '🟣' },
];

interface MapLayerChipsProps {
    activeLayers: MapLayer[];
    onToggle: (layer: MapLayer) => void;
}

export const MapLayerChips: React.FC<MapLayerChipsProps> = ({ activeLayers, onToggle }) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
            {LAYERS.map(({ key, label, icon }) => {
                const isActive = activeLayers.includes(key);
                return (
                    <TouchableOpacity
                        key={key}
                        onPress={() => onToggle(key)}
                        activeOpacity={0.7}
                        className={`flex-row items-center px-4 py-2 rounded-full border ${isActive
                            ? 'bg-gray-900 border-gray-900'
                            : 'bg-white border-gray-200'
                            }`}
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: isActive ? 0.15 : 0.05,
                            shadowRadius: 4,
                            elevation: isActive ? 3 : 1,
                        }}
                    >
                        <Text className="text-sm mr-1.5">{icon}</Text>
                        <Text
                            className={`text-[13px] font-semibold ${isActive ? 'text-white' : 'text-gray-700'
                                }`}
                        >
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};
