import React from 'react';
import { View, TouchableOpacity, ScrollView, Modal, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { Input, InputField } from '@/src/components/ui/input';

const { width } = Dimensions.get('window');

interface BusinessState {
    accountType: string;
    category: string;
    address: string;
}

interface ProfileMenuDrawerProps {
    visible: boolean;
    slideAnim: Animated.Value;
    paddingTop: number;
    paddingBottom: number;
    businessState: BusinessState;
    onClose: () => void;
    onLogout: () => void;
    onSaveBusiness: () => void;
    onBusinessStateChange: (state: BusinessState) => void;
}

export const ProfileMenuDrawer: React.FC<ProfileMenuDrawerProps> = ({
    visible,
    slideAnim,
    paddingTop,
    paddingBottom,
    businessState,
    onClose,
    onLogout,
    onSaveBusiness,
    onBusinessStateChange,
}) => (
    <Modal visible={visible} transparent animationType="none">
        <View className="flex-1 flex-row">
            <TouchableOpacity
                className="absolute inset-0 bg-black/40"
                activeOpacity={1}
                onPress={onClose}
            />
            <Animated.View
                style={{
                    transform: [{ translateX: slideAnim }],
                    width: width * 0.75,
                    backgroundColor: 'white',
                    height: '100%',
                    marginLeft: 'auto',
                    shadowColor: '#000',
                    shadowOffset: { width: -5, height: 0 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 5,
                    paddingTop,
                    paddingBottom,
                }}
            >
                <View className="px-5 py-4 border-b border-gray-100 flex-row justify-between items-center">
                    <Text className="text-lg font-bold text-gray-900">Menu</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#1F2937" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="px-5 py-3 border-b border-gray-100">
                        <TouchableOpacity className="py-3 flex-row items-center gap-3">
                            <Ionicons name="bookmark-outline" size={20} color="#374151" />
                            <Text className="text-base text-gray-800">Itens salvos</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="py-3 flex-row items-center gap-3 mt-1">
                            <Ionicons name="lock-closed-outline" size={20} color="#374151" />
                            <Text className="text-base text-gray-800">Privacidade da conta</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="px-5 py-5 border-b border-gray-100">
                        <Text className="text-sm font-bold text-gray-900 mb-3">Tipo de Perfil</Text>
                        <View className="flex-row gap-3">
                            {(['personal', 'business'] as const).map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    className={`flex-1 py-2.5 rounded-lg border flex-row items-center justify-center gap-2 ${businessState.accountType === type ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-200'}`}
                                    onPress={() => onBusinessStateChange({ ...businessState, accountType: type })}
                                >
                                    <Ionicons
                                        name={type === 'personal' ? 'person-outline' : 'briefcase-outline'}
                                        size={16}
                                        color={businessState.accountType === type ? '#F97316' : '#6B7280'}
                                    />
                                    <Text className={`text-[13px] font-bold ${businessState.accountType === type ? 'text-orange-600' : 'text-gray-500'}`}>
                                        {type === 'personal' ? 'Pessoal' : 'Negócio'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {businessState.accountType === 'business' && (
                            <View className="mt-4 gap-3">
                                <View>
                                    <Text className="text-[12px] font-semibold text-gray-500 mb-1">Categoria do Negócio</Text>
                                    <Input variant="outline" size="md" className="rounded-lg">
                                        <InputField
                                            placeholder="Ex: Restaurante, Bar..."
                                            value={businessState.category}
                                            onChangeText={(t) => onBusinessStateChange({ ...businessState, category: t })}
                                        />
                                    </Input>
                                </View>
                                <View>
                                    <Text className="text-[12px] font-semibold text-gray-500 mb-1">Endereço Completo</Text>
                                    <Input variant="outline" size="md" className="rounded-lg">
                                        <InputField
                                            placeholder="Endereço exato..."
                                            value={businessState.address}
                                            onChangeText={(t) => onBusinessStateChange({ ...businessState, address: t })}
                                        />
                                    </Input>
                                </View>
                                <TouchableOpacity
                                    className="bg-gray-900 rounded-lg py-3 items-center mt-2"
                                    onPress={onSaveBusiness}
                                >
                                    <Text className="text-white font-bold text-sm">Salvar Informações</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        className="px-5 py-5 flex-row items-center gap-3"
                        onPress={onLogout}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                        <Text className="text-base text-red-500 font-bold">Sair / Logout</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Animated.View>
        </View>
    </Modal>
);