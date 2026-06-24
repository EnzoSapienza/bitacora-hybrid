import { create } from 'zustand';
import { poiService } from '@/services/firestore/poiService';

interface PublicPointState {
    point: any | null;
    isLoading: boolean;
    error: string | null;
    loadPoint: (travelId: string, pointId: string) => Promise<void>;
    clearPoint: () => void;
}

export const usePublicPointStore = create<PublicPointState>((set) => ({
    point: null,
    isLoading: false,
    error: null,

    loadPoint: async (travelId: string, pointId: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await poiService.getPointById(travelId, pointId);
            if (!data) {
                set({ error: "Punto de interés no encontrado", isLoading: false });
                return;
            }
            set({ point: data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    clearPoint: () => set({ point: null, error: null })
}));