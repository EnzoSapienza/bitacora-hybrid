import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/firestore/userService';
import { useAppStore } from '@/store/appStore';
import { Typography } from '@/constants/typography';

export default function UsernameScreen() {
    const colors = useAppStore((s) => s.themescolors);
    const { t } = useTranslation();
    const { user, setNeedsUsername, loadProfile } = useAuthStore();
    const { logout } = useAuth();
    
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        if (!user?.uid || !username.trim()) return;
        
        const regex = /^[a-z0-9_]{3,}$/;
        if (!regex.test(username.toLowerCase())) {
            setError(t('auth.username.invalid'));
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const available = await userService.isUsernameAvailable(username.trim());
            if (!available) {
                setError(t('auth.username.taken'));
                return;
            }

            await userService.saveUsername(user.uid, username.trim());
            await loadProfile(user.uid);
            setNeedsUsername(false);
        } catch (e) {
            setError(t('auth.username.saveError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.grisFondoApp }]}>
            <Text style={[Typography.titleLarge, { color: colors.azulOscuro }]}>{t('auth.username.title')}</Text>
            <Text style={[Typography.bodyMedium, { color: colors.grisMedio }]}>{t('auth.username.subtitle')}</Text>

            <TextInput
                style={[
                    styles.input, 
                    { backgroundColor: colors.blanco, color: colors.grisOscuro, borderColor: error ? colors.rojoPin : colors.grisClaro }
                ]}
                placeholder={t('auth.username.placeholder')}
                placeholderTextColor={colors.grisMedio}
                value={username}
                onChangeText={(text) => {
                    setUsername(text);
                    setError(null);
                }}
                autoCapitalize="none"
            />

            {error && <Text style={{ color: colors.rojoPin, marginTop: 4 }}>{error}</Text>}

            <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.azulProfundo }]} 
                onPress={handleConfirm} 
                disabled={loading || loggingOut || username.length < 3}
            >
                {loading ? <ActivityIndicator color={colors.blanco} /> : <Text style={[Typography.labelLarge, { color: colors.blanco }]}>{t('auth.username.submit')}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutLink} onPress={logout} disabled={loading || loggingOut}>
                <Text style={{ color: colors.grisMedio, fontSize: 14 }}>{t('auth.username.logout')}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
    input: { borderRadius: 8, padding: 12, borderWidth: 1, fontSize: 16 },
    button: { borderRadius: 8, padding: 14, alignItems: 'center' },
    logoutLink: { marginTop: 8, alignItems: 'center' },
});