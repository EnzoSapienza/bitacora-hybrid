/*
 * Guardar de forma persistente y local los datos de autenticación de usuario
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '@/services/firestore/userService';

interface User {
    uid: string;
    email: string;
    nombre?: string;
    username?: string;
    photoUrl?: string;
    bio?: string;
    followersCount?: number;
    followingCount?: number;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
    loadProfile: (uid: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,

            setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
            clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),
            setLoading: (isLoading) => set({ isLoading }),

            loadProfile: async (uid) => {
                try {
                    const data = await userService.getPublicProfile(uid) as any;
                    if (!data) return;
                    set((state) => ({
                        user: {
                            ...state.user!,
                            nombre: data.nombre,
                            username: data.username,
                            photoUrl: data.photoUrl,
                            bio: data.bio,
                            followersCount: data.followersCount ?? 0,
                            followingCount: data.followingCount ?? 0,
                        }
                    }));
                } catch (e) {
                    console.error('Error cargando perfil:', e);
                }
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            // Solo persistir datos del usuario, no el estado de carga
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);