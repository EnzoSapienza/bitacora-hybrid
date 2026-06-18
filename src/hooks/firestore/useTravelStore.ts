import { create } from 'zustand';
import { travelService } from '../../services/firestore/travelService';
import Travel from '../../types/models/travel';

interface TravelState {
    travels: Travel[];
    loading: boolean;
    error: string | null;
    fetchTravels: (uid: string) => Promise<void>;
    addTravel: (travelData: any) => Promise<void>;
}

export const useTravelStore = create<TravelState>((set, get) => ({
    travels: [],
    loading: false,
    error: null,

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
                startDate: doc.startDate?.toDate ? doc.startDate.toDate() : new Date(),
                endDate: doc.endDate?.toDate ? doc.endDate.toDate() : new Date(),
                pointsCount: doc.pointsCount || 0,
                durationDays: doc.durationDays || 0,
                visibility: doc.visibility || 'PRIVATE',
                privileges: doc.privileges || null,
                updatedAt: doc.updatedAt?.toDate ? doc.updatedAt.toDate() : null,
            })) as Travel[];
            set({ travels: mappedTravels, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Error al cargar viajes', loading: false });
        }
    },

    addTravel: async (travelData) => {
        set({ loading: true, error: null });
        try {
            await travelService.create(travelData);
            await get().fetchTravels(travelData.ownerId);
        } catch (err: any) {
            set({ error: err.message || 'Error al crear el viaje', loading: false });
            throw err;
        }
    },
}));