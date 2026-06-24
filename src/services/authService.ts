/**
 * Encapsula todas las operaciones de autenticación con Firebase
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithCredential,
    type User,
    type Unsubscribe,
} from 'firebase/auth';
import { auth } from './firebase';

export const authService = {
    signUp: (email: string, password: string) =>
        createUserWithEmailAndPassword(auth, email, password),

    signIn: (email: string, password: string) =>
        signInWithEmailAndPassword(auth, email, password),

    signInWithGoogle: (idToken: string) => {
        const credential = GoogleAuthProvider.credential(idToken);
        return signInWithCredential(auth, credential);
    },

    signOut: () => signOut(auth),

    subscribe: (callback: (user: User | null) => void): Unsubscribe =>
        onAuthStateChanged(auth, callback),
};