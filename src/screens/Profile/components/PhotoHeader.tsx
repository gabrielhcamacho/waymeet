import React from "react";
import { View, TouchableOpacity, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PhotoHeaderProps {
    coverPhotoUrl: string;
    avatarUrl: string;
    onPickCover: () => void;
    onPickAvatar: () => void;
};

export const PhotoHeader: React.FC<PhotoHeaderProps> = ({ coverPhotoUrl, avatarUrl, onPickCover, onPickAvatar }) => (
    <View className="mb-6 -mx-5 mt-4">
        <TouchableOpacity activeOpacity={0.8} onPress={onPickCover} className="h-[150px] bg-gray-200 relative">
            {coverPhotoUrl ? (
                <ImageBackground source={{ uri: coverPhotoUrl }} className="w-full h-full">
                    <View style={{ position: 'absolute', width: '100%', height: '100%' }}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
                    </View>
                </ImageBackground>
            ) : null}
            <View className="absolute bg-black/40 w-10 h-10 rounded-full items-center justify-center top-1/2 left-1/2 -ml-5 -mt-5">
                <Ionicons name="camera" size={20} color="white" />
            </View>
        </TouchableOpacity>

        <View className="items-center -mt-[45px]">
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPickAvatar}
                className="w-[90px] h-[90px] rounded-full border-4 border-white bg-gray-100 overflow-hidden relative"
            >
                {avatarUrl ? (
                    <ImageBackground source={{ uri: avatarUrl }} className="w-full h-full" />
                ) : null}
                <View className="absolute inset-0 bg-black/30 items-center justify-center">
                    <Ionicons name="camera" size={24} color="white" />
                </View>
            </TouchableOpacity>
        </View>
    </View>
)