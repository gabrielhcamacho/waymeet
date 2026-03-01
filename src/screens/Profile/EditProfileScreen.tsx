import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { useUserStore } from '../../store/useUserStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, InputField } from '@/src/components/ui/input';

export const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { user, updateProfile, deleteAccount } = useUserStore();
    const [name, setName] = useState(user?.displayName || '');
    const [city, setCity] = useState(user?.homeCity || '');
    const [bio, setBio] = useState(user?.bio || '');

    const handleSave = () => {
        updateProfile({ displayName: name, homeCity: city, bio });
        navigation.goBack();
    };

    const handleDelete = () => {
        Alert.alert('Excluir conta', 'Tem certeza? Esta ação não pode ser desfeita.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: () => deleteAccount() },
        ]);
    };

    return (
        <View
            className="flex-1 bg-background px-5"
            style={{ paddingTop: insets.top + 10 }}
        >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-text">Editar Perfil</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text className="text-base font-semibold text-primary">Salvar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
                <View className="mb-5">
                    <Text className="text-sm font-semibold text-text mb-2">Nome</Text>
                    <Input variant="outline" size="xl" className="rounded-lg border-border flex-row items-center">
                        <InputField
                            placeholder="Seu nome"
                            value={name}
                            onChangeText={setName}
                            className="flex-1 text-[15px] text-text px-[14px] py-3"
                        />
                    </Input>
                </View>

                <View className="mb-5">
                    <Text className="text-sm font-semibold text-text mb-2">Cidade</Text>
                    <Input variant="outline" size="xl" className="rounded-lg border-border flex-row items-center">
                        <InputField
                            placeholder="Sua cidade"
                            value={city}
                            onChangeText={setCity}
                            className="flex-1 text-[15px] text-text px-[14px] py-3"
                        />
                    </Input>
                </View>

                <View className="mb-5">
                    <Text className="text-sm font-semibold text-text mb-2">Bio</Text>
                    <Input variant="outline" size="xl" className="rounded-lg border-border flex-row items-center h-[100px]">
                        <InputField
                            placeholder="Sobre você..."
                            value={bio}
                            onChangeText={setBio}
                            multiline
                            className="flex-1 text-[15px] text-text px-[14px] pt-3"
                            style={{ textAlignVertical: 'top' }}
                        />
                    </Input>
                </View>

                <TouchableOpacity
                    className="flex-row items-center justify-center gap-2 py-4 rounded-xl border-[1.5px] border-error mt-[30px]"
                    onPress={handleDelete}
                >
                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    <Text className="text-[15px] font-semibold text-error">Excluir conta</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};