import { create } from 'zustand';
import { travelService } from '../../services/firestore/travelService';
import Travel from '../../types/models/travel';

const toDate = (val: any, fallback: Date | null = null): Date | null => {
    if (!val) return fallback;
    if (val instanceof Date) return val;
    if (typeof val.toDate === 'function') return val.toDate();
    return fallback;
};

interface TravelState {
    travels: Travel[];
    loading: boolean;
    error: string | null;
    sharedTravels: Travel[];
    sharedLoading: boolean;
    sharedError: string | null;
    fetchTravels: (uid: string) => Promise<void>;
    fetchSharedTravels: (uid: string) => Promise<void>;
    addTravel: (travelData: any) => Promise<string>;
    updateTravelPrivileges: (tripId: string, privileges: string[]) => void;
    getTravelById: (id: string) => Promise<Travel | null>;
}

export const useTravelStore = create<TravelState>((set, get) => ({
    travels: [],
    loading: false,
    error: null,
    sharedTravels: [],
    sharedLoading: false,
    sharedError: null,

    fetchTravels: async (uid: string) => {
        set({ loading: true, error: null });
        try {
            const data = await travelService.getAll(uid);
            const mappedTravels = data.map((doc: any) => ({
                id: doc.id,
                name: doc.name || '',
                description: doc.description || '',
                ownerId: doc.ownerId || '',
                imageUrl: doc.imageUrl || null,
                startDate: toDate(doc.startDate) ?? new Date(),
                endDate: toDate(doc.endDate) ?? new Date(),
                pointsCount: doc.pointsCount || 0,
                durationDays: doc.durationDays || 0,
                visibility: doc.visibility || 'PRIVATE',
                privileges: doc.privileges || null,
                updatedAt: toDate(doc.updatedAt),
            })) as Travel[];
            set({ travels: mappedTravels, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Error al cargar viajes', loading: false });
        }
    },

    fetchSharedTravels: async (uid: string) => {
        set({ sharedLoading: true, sharedError: null });
        try {
            const data = await travelService.getSharedTravels(uid);
            const mappedTravels = data.map((doc: any) => ({
                id: doc.id,
                name: doc.name || '',
                description: doc.description || '',
                ownerId: doc.ownerId || '',
                imageUrl: doc.imageUrl || null,
                startDate: toDate(doc.startDate) ?? new Date(),
                endDate: toDate(doc.endDate) ?? new Date(),
                pointsCount: doc.pointsCount || 0,
                durationDays: doc.durationDays || 0,
                visibility: doc.visibility || 'PRIVATE',
                privileges: doc.privileges || null,
                updatedAt: toDate(doc.updatedAt),
            })) as Travel[];
            set({ sharedTravels: mappedTravels, sharedLoading: false });
        } catch (err: any) {
            set({ sharedError: err.message || 'Error al cargar viajes compartidos', sharedLoading: false });
        }
    },

    addTravel: async (travelData) => {
        set({ loading: true, error: null });
        try {
            const docRef = await travelService.create(travelData);
            await get().fetchTravels(travelData.ownerId);
            return docRef.id;
        } catch (err: any) {
            set({ error: err.message || 'Error al crear el viaje', loading: false });
            throw err;
        }
    },

    updateTravelPrivileges: (tripId: string, privileges: string[]) => {
        set((state) => ({
            travels: state.travels.map((t) =>
                t.id === tripId ? { ...t, privileges } : t
            ),
            sharedTravels: state.sharedTravels.map((t) =>
                t.id === tripId ? { ...t, privileges } : t
            ),
        }));
    },

    getTravelById: async (id: string) => {
        const state = get();
        const existing = state.travels.find(t => t.id === id) || state.sharedTravels.find(t => t.id === id);
        if (existing) return existing;
        try {
            const travel = await travelService.getById(id);
            return travel;
        } catch (e) {
            console.error("Error al obtener viaje individual:", e);
            return null;
        }
    },
}));