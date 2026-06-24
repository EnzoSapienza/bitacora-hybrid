import { create } from 'zustand';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { travelService } from '../../services/firestore/travelService';
import Travel from '../../types/models/travel';

const PAGE_SIZE = 10;

interface DiscoveryState {
    publicTravels: Travel[];
    followingTravels: Travel[];
    followingLastDoc: any;
    hasMoreFollowing: boolean;
    isLoadingMoreFollowing: boolean;
    isLoading: boolean;
    error: string | null;
    _uid: string;
    _followingIds: string[];

    loadDiscoveryData: (uid: string, followingIds: string[]) => Promise<void>;
    loadMoreFollowing: () => Promise<void>;
}

export const useDiscoveryStore = create<DiscoveryState>((set, get) => ({
    publicTravels: [],
    followingTravels: [],
    followingLastDoc: null,
    hasMoreFollowing: false,
    isLoadingMoreFollowing: false,
    isLoading: false,
    error: null,
    _uid: '',
    _followingIds: [],

    loadDiscoveryData: async (uid, _followingIds) => {
        set({ isLoading: true, error: null, _uid: uid });

        let realFollowingIds: string[] = [];
        try {
            const snap = await getDocs(collection(db, 'followers', uid, 'following'));
            realFollowingIds = snap.docs.map((d) => d.id);
            set({ _followingIds: realFollowingIds });
        } catch (e) {
            console.log('Error fetching followingIds:', e);
        }

        try {
            const res = await travelService.getPublicTravels(10);
            set({
                publicTravels: res.docs.filter(
                    (t: any) => !realFollowingIds.includes(t.ownerId) && t.ownerId !== uid
                ) as Travel[],
            });
        } catch (e) {
            console.log('Error public travels:', e);
        }

        try {
            const res = await travelService.getFollowingTravels(realFollowingIds, PAGE_SIZE);
            set({
                followingTravels: res.docs as Travel[],
                followingLastDoc: res.lastVisible,
                hasMoreFollowing: res.docs.length === PAGE_SIZE,
            });
        } catch (e) {
            console.log('Error following travels:', e);
        }

        set({ isLoading: false });
    },

    loadMoreFollowing: async () => {
        const { followingLastDoc, hasMoreFollowing, isLoadingMoreFollowing, _followingIds } = get();
        if (!hasMoreFollowing || isLoadingMoreFollowing || !followingLastDoc) return;

        set({ isLoadingMoreFollowing: true });

        try {
            const res = await travelService.getFollowingTravels(
                _followingIds,
                PAGE_SIZE,
                followingLastDoc
            );

            set((state) => ({
                followingTravels: [...state.followingTravels, ...(res.docs as Travel[])],
                followingLastDoc: res.lastVisible,
                hasMoreFollowing: res.docs.length === PAGE_SIZE,
                isLoadingMoreFollowing: false,
            }));
        } catch (e) {
            console.log('Error loadMoreFollowing:', e);
            set({ isLoadingMoreFollowing: false });
        }
    },
}));