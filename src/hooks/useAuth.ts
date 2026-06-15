/**
 * Comunica las screen con authStore y authService
 */

import { useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

WebBrowser.maybeCompleteAuthSession();

// Obtenés estos IDs en la consola de Firebase →
// Configuración del proyecto → Tu app → OAuth 2.0
const ANDROID_CLIENT_ID = 'TU_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const IOS_CLIENT_ID = 'TU_IOS_CLIENT_ID.apps.googleusercontent.com';
const WEB_CLIENT_ID = 'TU_WEB_CLIENT_ID.apps.googleusercontent.com';

export function useAuth() {
    const { user, isAuthenticated, setUser, clearUser } = useAuthStore();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [, response, promptAsync] = Google.useAuthRequest({
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
            return 'Email o contraseña incorrectos.';
        case 'auth/invalid-email':
            return 'El email no es válido.';
        case 'auth/too-many-requests':
            return 'Demasiados intentos. Intentá más tarde.';
        default:
            return 'Ocurrió un error. Intentá de nuevo.';
    }
}