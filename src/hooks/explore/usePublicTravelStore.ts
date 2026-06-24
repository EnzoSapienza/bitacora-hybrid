import { create } from 'zustand';
import { travelService } from '@/services/firestore/travelService';
import { poiService } from '@/services/firestore/poiService';
import { userService } from '@/services/firestore/userService';
import Travel from '@/types/models/travel';
import PointOfInterest from '@/types/models/pointOfInterest';
import UserProfile from '@/types/models/user';

interface PublicTravelState {
    travel: Travel | null;
    pointsOfInterest: PointOfInterest[];
    creatorUser: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    loadDetail: (travelId: string) => Promise<void>;
    clearDetail: () => void;
}

export const usePublicTravelStore = create<PublicTravelState>((set) => ({
    travel: null,
    pointsOfInterest: [],
    creatorUser: null,
    isLoading: false,
    error: null,
    loadDetail: async (travelId: string) => {
        set({ isLoading: true, error: null });
        try {
            const travelResult = (await travelService.getById(travelId)) as Travel | null;

            if (!travelResult) {
                set({ error: "Viaje no encontrado", isLoading: false });
                return;
            }

            const pointsResult = await poiService.getAllByTrip(travelId);
            const userResult = await userService.getPublicProfile(travelResult.ownerId);

            set({
                travel: travelResult,
                pointsOfInterest: pointsResult as PointOfInterest[],
                creatorUser: userResult as UserProfile | null,
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    clearDetail: () => {
        set({ travel: null, pointsOfInterest: [], creatorUser: null, error: null });
    }
}));