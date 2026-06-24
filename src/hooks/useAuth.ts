/**
 * Comunica las screen con authStore y authService
 */

import { useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

WebBrowser.maybeCompleteAuthSession();

const ANDROID_CLIENT_ID = '1901113908-6t60jns807ic20vtrv0q0m1tk19uq8r6.apps.googleusercontent.com';
const IOS_CLIENT_ID = '1901113908-er8u2hej1skg3btt3mkb29avg7tehdei.apps.googleusercontent.com';
const WEB_CLIENT_ID = '1901113908-r6sliik0sosrd0a7p9n7v1o11bih36pm.apps.googleusercontent.com';

export function useAuth() {
    const { user, isAuthenticated, setUser, clearUser, loadProfile } = useAuthStore();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: ANDROID_CLIENT_ID,
        iosClientId: IOS_CLIENT_ID,
        webClientId: WEB_CLIENT_ID,
    });

    const login = async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            const result = await authService.signIn(email, password);
            setUser({ uid: result.user.uid, email: result.user.email! });
            await loadProfile(result.user.uid);
        } catch (e: any) {
            setError(mapFirebaseError(e.code));
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        setError(null);
        setLoading(true);
        try {
            const result = await promptAsync();
            if (result?.type === 'success') {
                const idToken = result.authentication?.idToken;
                if (!idToken) throw new Error('No se obtuvo el token de Google.');
                const fbResult = await authService.signInWithGoogle(idToken);
                setUser({ uid: fbResult.user.uid, email: fbResult.user.email! });
                await loadProfile(fbResult.user.uid);
            }
        } catch (e: any) {
            setError(e.message ?? 'Error al iniciar sesión con Google.');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await authService.signOut();
        clearUser();
    };

    return { user, isAuthenticated, loading, error, login, loginWithGoogle, logout };
}

function mapFirebaseError(code: string): string {
    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-email':
            return 'Email o contraseña incorrectos.';
        case 'auth/too-many-requests':
            return 'Demasiados intentos. Intentá más tarde.';
        default:
            return 'Ocurrió un error. Intentá de nuevo.';
    }
}