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

interface LoginForm {
    email: string;
    password: string;
}

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { login, socialLogin, authStatus } = useUserStore();
    const [showPassword, setShowPassword] = useState(false);
    const isLoading = authStatus === 'loading';

    const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (data: LoginForm) => {
        try {
            await login(data.email, data.password);
        } catch (error: any) {
            Alert.alert('Erro', error?.message || 'Email ou senha incorretos');
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
                {/* Back button */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>Bem vindo de volta 👋</Text>
                    <Text style={styles.subtitle}>Entre na sua conta para continuar</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
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

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Senha</Text>
                        <Controller
                            control={control}
                            name="password"
                            rules={{ required: 'Senha é obrigatória' }}
                            render={({ field: { onChange, value } }) => (
                                <Input variant="outline" size="xl" style={styles.inputContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                                    <InputField
                                        placeholder="Sua senha"
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
                        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('ForgotPassword')}
                        style={styles.forgotPassword}
                    >
                        <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        onPress={handleSubmit(onSubmit)}
                        style={[styles.loginButton, isLoading && styles.buttonDisabled]}
                        disabled={isLoading}
                        activeOpacity={0.85}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={Colors.textInverse} />
                        ) : (
                            <Text style={styles.loginButtonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>ou continue com</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Social Login */}
                    <View style={styles.socialRow}>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => socialLogin('google')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="logo-google" size={22} color="#DB4437" />
                            <Text style={styles.socialButtonText}>Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.socialButton}
                            onPress={() => socialLogin('apple')}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="logo-apple" size={22} color={Colors.text} />
                            <Text style={styles.socialButtonText}>Apple</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Signup link */}
                <View style={[styles.signupLink, { paddingBottom: insets.bottom + 20 }]}>
                    <Text style={styles.signupText}>Não tem conta? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.signupTextBold}>Criar conta</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        marginBottom: 32,
    },
    welcomeText: {
        fontSize: FontSize['3xl'],
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
    },
    form: {
        gap: 16,
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
    },
    inputContainer: {
        borderRadius: BorderRadius.lg,
        borderColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputIcon: {
        marginLeft: 14,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: Colors.text,
        paddingHorizontal: 10,
        paddingVertical: 14,
    },
    errorText: {
        fontSize: 12,
        color: Colors.error,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        fontSize: 13,
        color: Colors.primary,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 16,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        marginTop: 8,
        ...Shadows.medium,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: Colors.textInverse,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        fontSize: 12,
        color: Colors.textMuted,
        paddingHorizontal: 12,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: BorderRadius.lg,
        borderWidth: 1.5,
        borderColor: Colors.border,
        gap: 8,
    },
    socialButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
    },
    signupLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingTop: 24,
    },
    signupText: {
        fontSize: 14,
        color: Colors.textSecondary,
    },
    signupTextBold: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.primary,
    },
});
