/**
 * Inicializar Firebase y exponer la aplicación
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA0A-0VGdCBt8ceDDJzM_Z_uwkth7I2gtM",
    authDomain: "bitacoraviajes-ca776.firebaseapp.com",
    projectId: "bitacoraviajes-ca776",
    storageBucket: "bitacoraviajes-ca776.firebasestorage.app",
    messagingSenderId: "1901113908",
    appId: "1:1901113908:web:ccb7db69705ee050161061"
};


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
