import * as Location from 'expo-location';

export interface UserLocation {
    latitude: number;
    longitude: number;
    city?: string;
}

export const locationService = {
    requestPermission: async (): Promise<boolean> => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            return status === 'granted';
        } catch {
            return false;
        }
    },

    getCurrentLocation: async (): Promise<UserLocation | null> => {
        try {
            const hasPermission = await locationService.requestPermission();
            if (!hasPermission) return null;

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
        } catch {
            return null;
        }
    },
};
