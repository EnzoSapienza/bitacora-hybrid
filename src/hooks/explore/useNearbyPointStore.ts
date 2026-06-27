import { create } from 'zustand';
import { poiService } from '@/services/firestore/poiService';
import type MapMarker from '@/types/models/MapMarker';
import { encodeGeohash, getSearchRange, calculateDistanceKm } from '@/components/utils/geohash';

const MAX_MARKERS = 60;
const CACHE_PRECISION = 5;

interface NearbyPoiState {
    visibleMarkers: MapMarker[];
    isLoading: boolean;
    error: string | null;
    _lastCellKey: string | null;
    fetchNearby: (
        uid: string,
        center: { lat: number; lng: number },
        radiusKm: number
    ) => Promise<void>;
}

export const useNearbyPoiStore = create<NearbyPoiState>((set, get) => ({
    visibleMarkers: [],
    isLoading: false,
    error: null,
    _lastCellKey: null,

    fetchNearby: async (uid, center, radiusKm) => {
        const cellKey = `${encodeGeohash(center.lat, center.lng, CACHE_PRECISION)}:${Math.round(radiusKm)}`;
        if (cellKey === get()._lastCellKey) return;

        set({ isLoading: true, error: null, _lastCellKey: cellKey });

        try {
            const range = getSearchRange(center.lat, center.lng, radiusKm);
            const points = await poiService.getAuthorizedNearbyPoints(uid, range);

            const markers: MapMarker[] = points
                .filter((p: any) => typeof p.lat === 'number' && typeof p.lng === 'number')
                .map((p: any) => ({ ...p, _distanceKm: calculateDistanceKm(center.lat, center.lng, p.lat, p.lng) }))
                .filter((p: any) => p._distanceKm <= radiusKm)
                .sort((a: any, b: any) => a._distanceKm - b._distanceKm)
                .slice(0, MAX_MARKERS)
                .map((p: any) => ({
                    id: p.id,
                    coords: [p.lng, p.lat],
                    name: p.name,
                    address: p.address ?? '',
                    tripId: p.tripId,
                }));

            set({ visibleMarkers: markers, isLoading: false });
        } catch (e: any) {
            console.log('Error fetchNearby:', e);
            set({ error: e.message, isLoading: false });
        }
    },
}));