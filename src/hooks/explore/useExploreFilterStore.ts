import { create } from 'zustand';
import { travelService } from '../../services/firestore/travelService';
import Travel from '../../types/models/travel';

const PAGE_SIZE = 10;

interface ExploreFilterState {
    filteredTravels: Travel[];
    filteredLastDoc: any;
    hasMoreFiltered: boolean;
    isLoadingMoreFiltered: boolean;

    isSearching: boolean;
    error: string | null;

    searchQuery: string;
    selectedDuration: string | null;
    isDetailedOnly: boolean;
    selectedMonth: number | null;
    selectedYear: number | null;
    isFilterModeActive: boolean;

    _uid: string;

    applyFilters: (uid: string) => Promise<void>;
    loadMoreFiltered: () => Promise<void>;
    setSearchQuery: (query: string, uid: string) => void;
    toggleDurationFilter: (duration: string | null, uid: string) => void;
    toggleDetailedFilter: (uid: string) => void;
    setMonthYearFilter: (month: number | null, year: number | null, uid: string) => void;
    clearAll: () => void;
}

export const useExploreFilterStore = create<ExploreFilterState>((set, get) => ({
    filteredTravels: [],
    filteredLastDoc: null,
    hasMoreFiltered: false,
    isLoadingMoreFiltered: false,

    isSearching: false,
    error: null,

    searchQuery: '',
    selectedDuration: null,
    isDetailedOnly: false,
    selectedMonth: null,
    selectedYear: null,
    isFilterModeActive: false,

    _uid: '',

    // ─── Aplicar filtros (primera página) ────────────────────────────────────
    applyFilters: async (uid) => {
        const state = get();
        const hasFilters =
            state.searchQuery ||
            state.selectedDuration ||
            state.isDetailedOnly ||
            state.selectedMonth;

        if (!hasFilters) {
            set({ isFilterModeActive: false, filteredTravels: [], filteredLastDoc: null });
            return;
        }

        set({ _uid: uid, isSearching: true, isFilterModeActive: true, error: null, filteredLastDoc: null, filteredTravels: [] });
        
        try {
            const res = await travelService.getFilteredTravels(
                uid,
                PAGE_SIZE,
                null,
                state.searchQuery,
                state.selectedDuration,
                state.isDetailedOnly,
                state.selectedMonth,
                state.selectedYear
            );
            set({
                filteredTravels: res.docs as Travel[],
                filteredLastDoc: res.lastVisible,
                hasMoreFiltered: res.docs.length === PAGE_SIZE,
                isSearching: false,
            });
        } catch (e: any) {
            set({ error: e.message, isSearching: false });
        }
    },

    // ─── Paginación real de filtros ───────────────────────────────────────────
    loadMoreFiltered: async () => {
        const { filteredLastDoc, hasMoreFiltered, isLoadingMoreFiltered, _uid } = get();
        if (!hasMoreFiltered || isLoadingMoreFiltered || !filteredLastDoc) return;

        const state = get();
        set({ isLoadingMoreFiltered: true });
        
        try {
            const res = await travelService.getFilteredTravels(
                _uid,
                PAGE_SIZE,
                filteredLastDoc,
                state.searchQuery,
                state.selectedDuration,
                state.isDetailedOnly,
                state.selectedMonth,
                state.selectedYear
            );
            set((prev) => ({
                filteredTravels: [...prev.filteredTravels, ...(res.docs as Travel[])],
                filteredLastDoc: res.lastVisible,
                hasMoreFiltered: res.docs.length === PAGE_SIZE,
                isLoadingMoreFiltered: false,
            }));
        } catch (e) {
            console.log('Error loadMoreFiltered:', e);
            set({ isLoadingMoreFiltered: false });
        }
    },

    // ─── Setters de filtros ───────────────────────────────────────────────────
    setSearchQuery: (query, uid) => {
        set({ searchQuery: query });
        const state = get();
        if (!query && !state.selectedDuration && !state.isDetailedOnly && !state.selectedMonth) {
            get().clearAll();
        } else {
            get().applyFilters(uid);
        }
    },

    toggleDurationFilter: (duration, uid) => {
        set((state) => ({
            selectedDuration: state.selectedDuration === duration ? null : duration,
            isDetailedOnly: false,
            selectedMonth: null,
            selectedYear: null,
        }));
        get().applyFilters(uid);
    },

    toggleDetailedFilter: (uid) => {
        set((state) => ({
            isDetailedOnly: !state.isDetailedOnly,
            selectedDuration: null,
            selectedMonth: null,
            selectedYear: null,
        }));
        get().applyFilters(uid);
    },

    setMonthYearFilter: (month, year, uid) => {
        set({
            selectedMonth: month,
            selectedYear: year,
            selectedDuration: null,
            isDetailedOnly: false,
        });
        get().applyFilters(uid);
    },

    clearAll: () => {
        set({
            searchQuery: '',
            selectedDuration: null,
            isDetailedOnly: false,
            selectedMonth: null,
            selectedYear: null,
            isFilterModeActive: false,
            filteredTravels: [],
            filteredLastDoc: null,
            hasMoreFiltered: false,
        });
    },
}));