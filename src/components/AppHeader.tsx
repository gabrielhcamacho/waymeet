import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../config/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AppHeaderProps {
    location?: string;
    onNotificationsPress?: () => void;
    onMessagesPress?: () => void
};

export function AppHeader({ location = "Londrina, Brasil", onNotificationsPress, onMessagesPress }: AppHeaderProps) {
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-row justify-between items-center px-5 py-3" style={{ paddingTop: insets.top }}>
            <View className="flex-row items-center gap-[5px]">
                <Ionicons name="location" size={16} color={Colors.primary} />
                <Text className="text-[13px] text-textSecondary font-medium">
                    {location}
                </Text>
            </View>
            <View className="flex-row gap-2">
                <TouchableOpacity
                    className="w-[38px] h-[38px] rounded-full bg-surface justify-center items-center"
                    onPress={onNotificationsPress}
                >
                    <Ionicons name="notifications-outline" size={22} color={Colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                    className="w-[38px] h-[38px] rounded-full bg-surface justify-center items-center"
                    onPress={onMessagesPress}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={22} color={Colors.text} />
                </TouchableOpacity>
            </View>
        </View>
    )
}