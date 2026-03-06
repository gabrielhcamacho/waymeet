import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { Colors, BorderRadius, Shadows, FontSize } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { useUserStore } from '../../store/useUserStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, InputField } from '@/src/components/ui/input';

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { resetPassword } = useUserStore();
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
        defaultValues: { email: '' },
    });

    const onSubmit = async (data: { email: string }) => {
        setLoading(true);
        try {
            await resetPassword(data.email);
            setSent(true);
        } catch (error: any) {
            Alert.alert('Erro', error?.message || 'Erro ao enviar email de recuperação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>

            <View style={styles.header}>
                <View style={styles.iconCircle}>
                    <Ionicons name="lock-open-outline" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.title}>Recuperar senha</Text>
                <Text style={styles.subtitle}>
                    {sent
                        ? 'Enviamos um link de recuperação para o seu email'
                        : 'Insira seu email para receber o link de recuperação'}
                </Text>
            </View>

            {!sent ? (
                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: 'Email é obrigatório',
                            pattern: { value: /^\S+@\S+$/i, message: 'Email inválido' },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <Input variant="outline" size="xl" style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                                <InputField
                                    placeholder="seu@email.com"
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    style={styles.input}
                                />
                            </Input>
                        )}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

                    <TouchableOpacity
                        onPress={handleSubmit(onSubmit)}
                        style={[styles.button, loading && styles.buttonDisabled]}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.textInverse} />
                        ) : (
                            <Text style={styles.buttonText}>Enviar link</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.sentContainer}>
                    <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
                    <Text style={styles.sentText}>Email enviado com sucesso!</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}
                        style={styles.button}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.buttonText}>Voltar ao Login</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 24 },
    backButton: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface,
        justifyContent: 'center', alignItems: 'center', marginBottom: 30,
    },
    header: { alignItems: 'center', marginBottom: 32 },
    iconCircle: {
        width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.chipBackground,
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    title: { fontSize: FontSize['2xl'], fontWeight: '700', color: Colors.text, marginBottom: 8 },
    subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
    form: { gap: 16 },
    inputContainer: {
        borderRadius: BorderRadius.lg, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center',
    },
    inputIcon: { marginLeft: 14 },
    input: { flex: 1, fontSize: 15, color: Colors.text, paddingHorizontal: 10, paddingVertical: 14 },
    errorText: { fontSize: 12, color: Colors.error },
    button: {
        backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: BorderRadius.xl,
        alignItems: 'center', ...Shadows.medium,
    },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textInverse },
    sentContainer: { alignItems: 'center', gap: 16, marginTop: 20 },
    sentText: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
});
