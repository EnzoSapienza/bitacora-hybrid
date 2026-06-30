import { create } from 'zustand';
import { poiService } from '../../services/firestore/poiService';

interface Point {
    id: string;
    name: string;
    address: string;
    notes: string;
    visitDate: Date | null;
    latitude: number;
    longitude: number;
    imageUrls: string[];
}

interface PointInput {
    name: string;
    address: string;
    notes: string;
    visitDate: string;
    visitTime: string;
    latitude: number;
    longitude: number;
    imageUrls: string[];
    authorizedUsers: string[];
}

interface PoiState {
    points: Point[];
    loading: boolean;
    error: string | null;
    fetchPoints: (tripId: string) => Promise<void>;
    addPoint: (tripId: string, pointData: PointInput) => Promise<string>;
}

export const usePoiStore = create<PoiState>((set, get) => ({
    points: [],
    loading: false,
    error: null,

    fetchPoints: async (tripId) => {
        set({ loading: true, error: null });
        try {
            const data = await poiService.getAllByTrip(tripId);
            set({ points: data as Point[], loading: false });
        } catch (err: any) {
            set({ error: err.message || "Error al cargar los puntos", loading: false });
        }
    },

    addPoint: async (tripId, pointData) => {
        set({ loading: true, error: null });
        try {
            const newId = await poiService.savePoint(tripId, pointData);
            await get().fetchPoints(tripId);
            return newId;
        } catch (err: any) {
            set({ error: err.message || "Error al guardar el punto", loading: false });
            throw err;
        }
    }
}));