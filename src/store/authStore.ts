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
    needsUsername: boolean;
    setUser: (user: User) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
    setNeedsUsername: (needs: boolean) => void;
    loadProfile: (uid: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,
            needsUsername: false,

            setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
            clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false, needsUsername: false }),
            setLoading: (isLoading) => set({ isLoading }),
            setNeedsUsername: (needsUsername) => set({ needsUsername }),

            loadProfile: async (uid) => {
                try {
                    const data = await userService.getPublicProfile(uid) as any;
                    if (!data) return;
                    const needsUsername = !data.username;
                    set((state) => ({
                        user: {
                            ...state.user!,
                            nombre: data.nombre,
                            username: data.username,
                            photoUrl: data.photoUrl,
                            bio: data.bio,
                            followersCount: data.followersCount ?? 0,
                            followingCount: data.followingCount ?? 0,
                        },
                        needsUsername
                    }));
                } catch (e) {
                    console.error('Error cargando perfil:', e);
                }
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                needsUsername: state.needsUsername,
            }),
        }
    )
);