/**
 * Comunica las screens con authStore y authService
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { userService } from '../services/firestore/userService';

const IOS_CLIENT_ID = '1901113908-er8u2hej1skg3btt3mkb29avg7tehdei.apps.googleusercontent.com';
const WEB_CLIENT_ID = '1901113908-r6sliik0sosrd0a7p9n7v1o11bih36pm.apps.googleusercontent.com';

GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
});

export function useAuth() {
    const { user, isAuthenticated, setUser, clearUser, setLoading, isLoading, loadProfile } = useAuthStore();
    const { t } = useTranslation();
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
            setError(mapFirebaseError(e.code, t));
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

            const idToken = (response as any).data?.idToken ?? (response as any)?.idToken;
            if (!idToken) {
                setError(t('auth.errors.googleNoToken'));
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
                        setError(t('auth.errors.googleInProgress'));
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        setError(t('auth.errors.googlePlayServices'));
                        break;
                    default:
                        setError(t('auth.errors.googleDefault'));
                }
            } else {
                setError(e.message ?? t('auth.errors.googleDefault'));
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await authService.signOut();
        try {
            await GoogleSignin.signOut();
        } catch {}
    };

    const register = async (nombre: string, email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            const userCredential = await authService.signUp(email, password);
            await userService.createUserProfile(userCredential.user.uid, { nombre, email });
        } catch (e: any) {
            const message = e.code ? mapFirebaseError(e.code, t) : t('auth.errors.default');
            setError(message);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    return {
        user,
        isAuthenticated,
        loading: isLoading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
    };
}

function mapFirebaseError(code: string, t: (key: string) => string): string {
    switch (code) {
        case 'auth/email-already-in-use':
            return t('auth.errors.emailInUse');
        case 'auth/weak-password':
            return t('auth.errors.weakPassword');
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return t('auth.errors.invalidCredential');
        case 'auth/invalid-email':
            return t('auth.errors.invalidEmail');
        case 'auth/too-many-requests':
            return t('auth.errors.tooManyRequests');
        default:
            return t('auth.errors.default');
    }
}