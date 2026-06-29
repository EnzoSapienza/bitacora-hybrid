import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import { Typography } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
    const navigation = useNavigation<any>();
    const colors = useAppStore((s) => s.themescolors);
    const { t } = useTranslation();
    const { register, loading, error: authError } = useAuth();

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const displayError = localError || authError;

    const handleRegister = async () => {
        setLocalError(null);
        if (nombre.trim().length < 2) {
            return setLocalError(t('auth.register.nameMin'));
        }
        if (email.length < 5 || !email.includes('@')) {
            return setLocalError(t('auth.register.emailInvalid'));
        }
        if (password.length < 6) {
            return setLocalError(t('auth.register.passwordMin'));
        }
        if (password !== confirmPassword) {
            return setLocalError(t('auth.register.passwordMismatch'));
        }

        try {
            await register(nombre, email, password);
        } catch (e) {
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: colors.grisFondoApp }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}

        >
            <View style={styles.container}>

                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../../assets/screen.png')}
                        style={[styles.logo, { tintColor: colors.azulOscuro }]}
                        resizeMode="contain"
                    />
                    <Text style={{ color: colors.azulOscuro, fontSize: 32, fontWeight: 'bold' }}>Bitácora</Text>
                </View>

                <Text style={[Typography.titleLarge, { color: colors.azulOscuro }]}>{t('auth.register.title')}</Text>
                <Text style={{ color: colors.grisMedio }}>{t('auth.register.subtitle')}</Text>

                <TextInput
                    style={[styles.input, { backgroundColor: colors.blanco, color: colors.grisOscuro, borderColor: colors.grisClaro }]}
                    placeholder={t('auth.register.nameLabel')}
                    placeholderTextColor={colors.grisMedio}
                    value={nombre}
                    onChangeText={(text) => { setNombre(text); setLocalError(null); }}
                />

                <TextInput
                    style={[styles.input, { backgroundColor: colors.blanco, color: colors.grisOscuro, borderColor: colors.grisClaro }]}
                    placeholder={t('auth.register.emailLabel')}
                    placeholderTextColor={colors.grisMedio}
                    value={email}
                    onChangeText={(text) => { setEmail(text); setLocalError(null); }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, styles.passwordInput, { backgroundColor: colors.blanco, color: colors.grisOscuro, borderColor: colors.grisClaro }]}
                        placeholder={t('auth.register.passwordLabel')}
                        placeholderTextColor={colors.grisMedio}
                        value={password}
                        onChangeText={(text) => { setPassword(text); setLocalError(null); }}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={colors.grisMedio} />
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={[styles.input, { backgroundColor: colors.blanco, color: colors.grisOscuro, borderColor: colors.grisClaro }]}
                    placeholder={t('auth.register.confirmPasswordLabel')}
                    placeholderTextColor={colors.grisMedio}
                    value={confirmPassword}
                    onChangeText={(text) => { setConfirmPassword(text); setLocalError(null); }}
                    secureTextEntry={!showPassword}
                />

                {displayError && (
                    <Text style={{ color: colors.rojoPin, textAlign: 'center' }}>
                        {displayError}
                    </Text>
                )}

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.azulProfundo }]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.blanco} />
                    ) : (
                        <Text style={[Typography.labelLarge, { color: colors.blanco }]}>{t('auth.register.submit')}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                    <Text style={{ color: colors.azulOscuro, fontSize: 14 }}>{t('auth.register.alreadyHaveAccount')}</Text>
                </TouchableOpacity>

            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
    logoContainer: { alignItems: 'center', gap: 8, marginBottom: 8 },
    logo: { width: 100, height: 100 },
    input: { borderRadius: 8, padding: 12, borderWidth: 1, fontSize: 16 },
    passwordContainer: { flexDirection: 'row', alignItems: 'center' },
    passwordInput: { flex: 1 },
    eyeIcon: { position: 'absolute', right: 12 },
    button: { borderRadius: 8, padding: 14, alignItems: 'center' },
    loginLink: { marginTop: 16, alignItems: 'center' },
});