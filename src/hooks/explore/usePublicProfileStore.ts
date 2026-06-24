import { create } from 'zustand';
import { travelService } from '@/services/firestore/travelService';
import { userService } from '@/services/firestore/userService';
import Travel from '@/types/models/travel';
import UserProfile from '@/types/models/user';

interface PublicProfileState {
    user: UserProfile | null;
    travels: Travel[];
    isFollowing: boolean;
    isLoading: boolean;
    error: string | null;
    loadProfile: (targetUserId: string, currentUserId?: string) => Promise<void>;
    toggleFollow: (targetUserId: string, currentUserId: string) => Promise<void>;
    clearProfile: () => void;
}

export const usePublicProfileStore = create<PublicProfileState>((set, get) => ({
    user: null,
    travels: [],
    isFollowing: false,
    isLoading: false,
    error: null,

    loadProfile: async (targetUserId: string, currentUserId?: string) => {
        set({ isLoading: true, error: null });
        try {
            const userResult = await userService.getPublicProfile(targetUserId) as UserProfile | null;

            let following = false;
            if (currentUserId && currentUserId !== targetUserId) {
                following = await userService.isFollowing(currentUserId, targetUserId);
            }

            const travelsResult = await travelService.getPublicUserTravels(targetUserId, following);

            set({
                user: userResult,
                travels: travelsResult as Travel[],
                isFollowing: following,
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    toggleFollow: async (targetUserId: string, currentUserId: string) => {
        const state = get();
        if (!state.user || !currentUserId) return;

        const currentIsFollowing = state.isFollowing;
        set({ isFollowing: !currentIsFollowing });

        try {
            if (currentIsFollowing) {
                await userService.unfollowUser(currentUserId, targetUserId);
                set((prev) => ({
                    user: prev.user ? { ...prev.user, followersCount: Math.max(0, (prev.user.followersCount || 0) - 1) } : null
                }));
            } else {
                await userService.followUser(currentUserId, targetUserId);
                set((prev) => ({
                    user: prev.user ? { ...prev.user, followersCount: (prev.user.followersCount || 0) + 1 } : null
                }));
            }
        } catch (error) {
            set({ isFollowing: currentIsFollowing });
            console.error("Error toggling follow:", error);
        }
    },

    clearProfile: () => {
        set({ user: null, travels: [], isFollowing: false, error: null });
    }
}));