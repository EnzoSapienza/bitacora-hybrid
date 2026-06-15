/**
 * Inicializar Firebase y exponer la aplicación
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyBw10JNp0JF_Bsnep_PoOfxcyVE_QcMQa0',
    authDomain: "bitacoraviajes-ca776.firebaseapp.com",
    projectId: "bitacoraviajes-ca776",
    storageBucket: "bitacoraviajes-ca776.firebasestorage.app",
    messagingSenderId: "1901113908",
    appId: "1:1901113908:android:05f1986009ca9ef4161061",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);