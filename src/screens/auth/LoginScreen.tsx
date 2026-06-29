import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/appStore';
import { Typography } from '@/constants/typography';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const colors = useAppStore((s) => s.themescolors);
    const { t } = useTranslation();
    const { login, loginWithGoogle, loading, error } = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: colors.grisFondoApp }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.container}>
                <Text style={[Typography.titleLarge, { color: colors.azulOscuro }]}>{t('auth.login.title')}</Text>
                
                <TextInput 
                    style={[styles.input, { backgroundColor: colors.blanco, color: colors.grisOscuro, borderColor: colors.grisClaro }]} 
                    placeholder={t('auth.login.emailPlaceholder')}
                    placeholderTextColor={colors.grisMedio}
                    value={email} 
                    onChangeText={setEmail} 
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput 
                    style={[styles.input, { backgroundColor: colors.blanco, color: colors.grisOscuro, borderColor: colors.grisClaro }]} 
                    placeholder={t('auth.login.passwordPlaceholder')}
                    placeholderTextColor={colors.grisMedio}
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry 
                />
                
                {error && <Text style={{ color: colors.rojoPin, textAlign: 'center', marginVertical: 8 }}>{error}</Text>}

                {/* Botón Ingresar */}
                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: colors.azulProfundo }]} 
                    onPress={() => login(email, password)} 
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.blanco} />
                    ) : (
                        <Text style={[Typography.labelLarge, { color: colors.blanco }]}>{t('auth.login.submit')}</Text>
                    )}
                </TouchableOpacity>

                {/* Divisor */}
                <View style={styles.divider}>
                    <View style={[styles.dividerLine, { backgroundColor: colors.grisClaro }]} />
                    <Text style={{ color: colors.grisMedio, marginHorizontal: 12 }}>o</Text>
                    <View style={[styles.dividerLine, { backgroundColor: colors.grisClaro }]} />
                </View>

                {/* Botón Google */}
                <TouchableOpacity 
                    style={[styles.button, { backgroundColor: colors.blanco, borderWidth: 1, borderColor: colors.grisClaro }]} 
                    onPress={loginWithGoogle} 
                    disabled={loading}
                >
                    <Text style={[Typography.labelLarge, { color: colors.azulOscuro }]}>Continuar con Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                    <Text style={{ color: colors.azulOscuro }}>{t('auth.login.noAccount')}</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
    input: { borderRadius: 8, padding: 14, borderWidth: 1, fontSize: 16 },
    button: { borderRadius: 8, padding: 14, alignItems: 'center' },
    registerLink: { marginTop: 16, alignItems: 'center' },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
    dividerLine: { flex: 1, height: 1 }
});