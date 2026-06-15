/**
 * Encapsula todas operaciones de autenticación
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User,
    GoogleAuthProvider,
    signInWithCredential
} from "firebase/auth";
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


    signOut: () =>
        signOut(auth),

    subscribe: (callback: (user: User | null) => void) =>
        onAuthStateChanged(auth, callback),
}