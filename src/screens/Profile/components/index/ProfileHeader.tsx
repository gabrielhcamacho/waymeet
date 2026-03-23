import React from 'react';
import { View, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/text';
import { FlipAvatar } from './FlipAvatar';
import { User } from '@/src/types';

interface ProfileHeaderProps {
    user: User | null;
    paddingTop: number;
    onEditPress: () => void;
    onMenuPress: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user,
    paddingTop,
    onEditPress,
    onMenuPress,
}) => (
    <>
        <ImageBackground
            source={{ uri: user?.coverPhotoUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop' }}
            className="h-[200px] w-full"
        >
            <View className="flex-1 bg-black/15 p-4" style={{ paddingTop }}>
                <View className="flex-row justify-between">
                    <View />
                    <TouchableOpacity
                        className="w-[38px] h-[38px] rounded-full bg-black/40 justify-center items-center border border-white/20"
                        onPress={onMenuPress}
                    >
                        <Ionicons name="menu" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>

        <View className="items-center px-5 -mt-[45px]">
            <FlipAvatar
                avatarUrl={user?.avatarUrl || ''}
                bitmojiConfig={user?.secondaryAvatarSeed || ''}
            />

            <Text className="text-2xl font-bold text-gray-900 mt-3">
                {user?.displayName || 'User'}
            </Text>

            <View className="flex-row items-center gap-3 mt-2">
                <View className="bg-gray-100 rounded-full px-3 py-1">
                    <Text className="text-[12px] font-semibold text-gray-500">
                        {user?.mode === 'morador' ? '🏠 morador' : '✈️ visitante'}
                    </Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="text-[13px] font-bold text-amber-600">
                        {user?.reputation?.toFixed(1) || '0.0'}
                    </Text>
                </View>
            </View>

            <View className="flex-row items-center gap-1 mt-2">
                <Ionicons name="location-outline" size={14} color="#9CA3AF" />
                <Text className="text-[13px] text-gray-400">
                    {user?.homeCity || 'Cidade não definida'}
                </Text>
            </View>

            {user?.bio ? (
                <Text className="text-[13px] text-gray-400 text-center mt-2 leading-5">
                    {user.bio}
                </Text>
            ) : null}

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onEditPress}
                className="w-full bg-gray-100 py-3 rounded-xl items-center mt-5 mb-2"
            >
                <Text className="text-[14px] font-bold text-gray-900">Editar Perfil</Text>
            </TouchableOpacity>
        </View>
    </>
);