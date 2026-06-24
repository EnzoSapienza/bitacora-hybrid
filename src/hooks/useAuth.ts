/**
 * Comunica las screens con authStore y authService
 */
import { useState, useEffect } from 'react';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';

const IOS_CLIENT_ID = '1901113908-er8u2hej1skg3btt3mkb29avg7tehdei.apps.googleusercontent.com';
const WEB_CLIENT_ID = '1901113908-r6sliik0sosrd0a7p9n7v1o11bih36pm.apps.googleusercontent.com';

GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
});

export function useAuth() {
    const { user, isAuthenticated, setUser, clearUser, setLoading, isLoading, loadProfile } = useAuthStore();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = authService.subscribe((firebaseUser) => {
            if (firebaseUser) {
                setUser({ uid: firebaseUser.uid, email: firebaseUser.email! });
                loadProfile(firebaseUser.uid);
            } else {
                clearUser();
            }
        });
        return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            await authService.signIn(email, password);
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
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();

            const idToken = response.data?.idToken;
            if (!idToken) {
                setError('No se obtuvo el token de Google.');
                return;
            }

            await authService.signInWithGoogle(idToken);
        } catch (e: any) {
            if (isErrorWithCode(e)) {
                console.error(e);
                switch (e.code) {
                    case statusCodes.SIGN_IN_CANCELLED:
                        break;
                    case statusCodes.IN_PROGRESS:
                        setError('Ya hay un inicio de sesión en curso.');
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        setError('Google Play Services no está disponible.');
                        break;
                    default:
                        setError('Error al iniciar sesión con Google.');
                }
            } else {
                setError(e.message ?? 'Error al iniciar sesión con Google.');
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await authService.signOut();
        try {
            await GoogleSignin.signOut();
        } catch {
        }
    };

    return { user, isAuthenticated, loading: isLoading, error, login, loginWithGoogle, logout };
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