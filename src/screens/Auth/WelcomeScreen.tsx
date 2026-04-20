import React from 'react';
import { View, TouchableOpacity, StyleSheet, ImageBackground, StatusBar } from 'react-native';
import { Colors, FontSize } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { MapPin, Calendar, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();

    return (
        <ImageBackground
            source={require('../../../assets/welcome-bg.png')}
            style={styles.container}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" />

            {/* Dark overlay */}
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' }} />

            {/* Header text */}
            <View style={[styles.headerContainer, { paddingTop: insets.top + 40 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 8 }}>
                        <Ionicons name="location" size={22} color="white" />
                    </View>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: 'white', letterSpacing: 1 }}>WayMeet</Text>
                </View>
                <Text style={styles.headerText}>
                    Conecte-se{'\n'}com quem{'\n'}está perto
                </Text>
                <Text style={styles.subtitleText}>
                    Descubra eventos, lugares e pessoas na sua cidade
                </Text>
            </View>

            <View style={styles.spacer} />

            {/* Bottom section with buttons */}
            <View style={[styles.bottomContent, { paddingBottom: insets.bottom + 20 }]}>
                {/* Feature pills */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24, width: '100%' }}>
                    {([
                        { Icon: Calendar, label: 'Eventos' },
                        { Icon: Users, label: 'Pessoas' },
                        { Icon: MapPin, label: 'Lugares' },
                    ] as const).map(({ Icon, label }) => (
                        <View key={label} style={{ flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 10, gap: 4 }}>
                            <Icon size={18} color="white" strokeWidth={2} />
                            <Text style={{ fontSize: 11, color: 'white', fontWeight: '600' }}>{label}</Text>
                        </View>
                    ))}
                </View>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => navigation.navigate('Signup')}
                    activeOpacity={0.85}
                    accessibilityLabel="Começar agora"
                >
                    <Text style={styles.startButtonText}>Começar Agora</Text>
                    <Ionicons name="arrow-forward" size={22} color={Colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.7}
                    style={styles.loginLink}
                >
                    <Text style={styles.loginText}>
                        Já tem uma conta? <Text style={styles.loginTextBold}>Entre</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    headerContainer: {
        paddingHorizontal: 30,
    },
    headerText: {
        fontSize: FontSize['6xl'],
        fontWeight: '800',
        color: Colors.textInverse,
        lineHeight: 50,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitleText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.85)',
        marginTop: 12,
        lineHeight: 24,
    },
    spacer: {
        flex: 1,
    },
    bottomContent: {
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.background,
        paddingVertical: 16,
        paddingHorizontal: 40,
        borderRadius: 30,
        gap: 12,
        width: '100%',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },
    startButtonText: {
        fontSize: FontSize.lg,
        fontWeight: '600',
        color: Colors.text,
    },
    loginLink: {
        padding: 8,
    },
    loginText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    loginTextBold: {
        fontWeight: '700',
        color: Colors.textInverse,
    },
});
