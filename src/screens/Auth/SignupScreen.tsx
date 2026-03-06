import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { Colors, BorderRadius, Shadows, FontSize } from '../../config/theme';
import { Text } from '@/src/components/ui/text';
import { useUserStore } from '../../store/useUserStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, InputField } from '@/src/components/ui/input';

interface SignupForm {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
    gdprConsent: boolean;
}

export const SignupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { signup, socialLogin, authStatus } = useUserStore();
    const [showPassword, setShowPassword] = useState(false);
    const [gdprChecked, setGdprChecked] = useState(false);
    const isLoading = authStatus === 'loading';

    const { control, handleSubmit, formState: { errors }, watch } = useForm<SignupForm>({
        defaultValues: { displayName: '', email: '', password: '', confirmPassword: '', gdprConsent: false },
    });
    const password = watch('password');

    const getPasswordStrength = (pwd: string): { label: string; color: string; width: `${number}%` } => {
        if (pwd.length < 4) return { label: 'Fraca', color: Colors.error, width: '25%' };
        if (pwd.length < 8) return { label: 'Média', color: Colors.warning, width: '50%' };
        if (pwd.length < 12) return { label: 'Forte', color: Colors.success, width: '75%' };
        return { label: 'Muito forte', color: Colors.success, width: '100%' };
    };

    const strength = getPasswordStrength(password || '');

    const onSubmit = async (data: SignupForm) => {
        if (!gdprChecked) {
            Alert.alert('Atenção', 'Você precisa aceitar os termos para continuar');
            return;
        }
        try {
            await signup(data.email, data.password, data.displayName);
        } catch (error: any) {
            Alert.alert('Erro', error?.message || 'Erro ao criar conta');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
                keyboardShouldPersistTaps="handled"
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.headerText}>Criar conta ✨</Text>
                    <Text style={styles.subtitle}>Preencha seus dados para começar</Text>
                </View>

                <View style={styles.form}>
                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nome</Text>
                        <Controller
                            control={control}
                            name="displayName"
                            rules={{ required: 'Nome é obrigatório' }}
                            render={({ field: { onChange, value } }) => (
                                <Input variant="outline" size="xl" style={styles.inputContainer}>
                                    <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                                    <InputField
                                        placeholder="Seu nome"
                                        value={value}
                                        onChangeText={onChange}
                                        style={styles.input}
                                    />
                                </Input>
                            )}
                        />
                        {errors.displayName && <Text style={styles.errorText}>{errors.displayName.message}</Text>}
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
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
                    </View>

                    {/* Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Senha</Text>
                        <Controller
                            control={control}
                            name="password"
                            rules={{
                                required: 'Senha é obrigatória',
                                minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                            }}
                            render={({ field: { onChange, value } }) => (
                                <Input variant="outline" size="xl" style={styles.inputContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                                    <InputField
                                        placeholder="Crie uma senha"
                                        value={value}
                                        onChangeText={onChange}
                                        secureTextEntry={!showPassword}
                                        style={styles.input}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color={Colors.textMuted}
                                            style={{ marginRight: 12 }}
                                        />
                                    </TouchableOpacity>
                                </Input>
                            )}
                        />
                        {password && password.length > 0 && (
                            <View style={styles.strengthContainer}>
                                <View style={styles.strengthBar}>
                                    <View
                                        style={[styles.strengthFill, { width: strength.width, backgroundColor: strength.color }]}
                                    />
                                </View>
                                <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                            </View>
                        )}
                        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirmar senha</Text>
                        <Controller
                            control={control}
                            name="confirmPassword"
                            rules={{
                                required: 'Confirme sua senha',
                                validate: (value) => value === password || 'As senhas não coincidem',
                            }}
                            render={({ field: { onChange, value } }) => (
                                <Input variant="outline" size="xl" style={styles.inputContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                                    <InputField
                                        placeholder="Repita a senha"
                                        value={value}
                                        onChangeText={onChange}
                                        secureTextEntry
                                        style={styles.input}
                                    />
                                </Input>
                            )}
                        />
                        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
                    </View>

                    {/* GDPR Consent */}
                    <TouchableOpacity
                        style={styles.consentRow}
                        onPress={() => setGdprChecked(!gdprChecked)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={gdprChecked ? 'checkbox' : 'square-outline'}
                            size={22}
                            color={gdprChecked ? Colors.primary : Colors.textMuted}
                        />
                        <Text style={styles.consentText}>
                            Concordo com os Termos de Uso e Política de Privacidade, incluindo o uso de dados de localização.
                        </Text>
                    </TouchableOpacity>

                    {/* Signup Button */}
                    <TouchableOpacity
                        onPress={handleSubmit(onSubmit)}
                        style={[styles.signupButton, isLoading && styles.buttonDisabled]}
                        disabled={isLoading}
                        activeOpacity={0.85}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.textInverse} />
                        ) : (
                            <Text style={styles.signupButtonText}>Criar conta</Text>
                        )}
                    </TouchableOpacity>

                    {/* Social */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>ou continue com</Text>
                        <View style={styles.dividerLine} />
                    </View>
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialButton} onPress={() => socialLogin('google')}>
                            <Ionicons name="logo-google" size={22} color="#DB4437" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialButton} onPress={() => socialLogin('apple')}>
                            <Ionicons name="logo-apple" size={22} color={Colors.text} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.loginLink, { paddingBottom: insets.bottom + 20 }]}>
                    <Text style={styles.loginText}>Já tem conta? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginTextBold}>Entrar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { flexGrow: 1, paddingHorizontal: 24 },
    backButton: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface,
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    },
    header: { marginBottom: 28 },
    headerText: { fontSize: FontSize['3xl'], fontWeight: '700', color: Colors.text, marginBottom: 8 },
    subtitle: { fontSize: FontSize.md, color: Colors.textSecondary },
    form: { gap: 16 },
    inputGroup: { gap: 6 },
    label: { fontSize: 13, fontWeight: '600', color: Colors.text },
    inputContainer: {
        borderRadius: BorderRadius.lg, borderColor: Colors.border, flexDirection: 'row', alignItems: 'center',
    },
    inputIcon: { marginLeft: 14 },
    input: { flex: 1, fontSize: 15, color: Colors.text, paddingHorizontal: 10, paddingVertical: 14 },
    errorText: { fontSize: 12, color: Colors.error },
    strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    strengthBar: { flex: 1, height: 4, backgroundColor: Colors.borderLight, borderRadius: 2, overflow: 'hidden' },
    strengthFill: { height: '100%', borderRadius: 2 },
    strengthLabel: { fontSize: 11, fontWeight: '500' },
    consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
    consentText: { fontSize: 12, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
    signupButton: {
        backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: BorderRadius.xl,
        alignItems: 'center', marginTop: 4, ...Shadows.medium,
    },
    buttonDisabled: { opacity: 0.7 },
    signupButtonText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textInverse },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
    dividerText: { fontSize: 12, color: Colors.textMuted, paddingHorizontal: 12 },
    socialRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
    socialButton: {
        width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, borderColor: Colors.border,
        justifyContent: 'center', alignItems: 'center',
    },
    loginLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', paddingTop: 24 },
    loginText: { fontSize: 14, color: Colors.textSecondary },
    loginTextBold: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});
