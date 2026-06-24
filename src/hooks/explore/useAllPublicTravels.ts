import { useCallback, useEffect, useMemo, useState } from "react";
import { travelService } from "@/services/firestore/travelService";
import { useDiscoveryStore } from "@/hooks/explore/useDiscoveryStore";
import { useAuthStore } from "@/store/authStore";
import Travel from "@/types/models/travel";

const PAGE_SIZE = 10;

export function useAllPublicTravels() {
    const { user } = useAuthStore();
    const followingIds = useDiscoveryStore((s) => s._followingIds);

    const [travels, setTravels] = useState<Travel[]>([]);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const blackListIds = useMemo(
        () => (user?.uid ? [...followingIds, user.uid] : followingIds),
        [followingIds, user?.uid]
    );

    const loadFirstPage = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await travelService.getPublicTravels(PAGE_SIZE, null, blackListIds);
            setTravels(res.docs as Travel[]);
            setLastDoc(res.lastVisible);
            setHasMore(res.docs.length === PAGE_SIZE);
        } catch (e: any) {
            setError(e.message ?? "Error al cargar viajes");
        } finally {
            setIsLoading(false);
        }
    }, [blackListIds]);

    useEffect(() => {
        loadFirstPage();
    }, [loadFirstPage]);

    const loadMore = useCallback(async () => {
        if (!hasMore || isLoadingMore || !lastDoc) return;
        setIsLoadingMore(true);
        try {
            const res = await travelService.getPublicTravels(PAGE_SIZE, lastDoc, blackListIds);
            setTravels((prev) => [...prev, ...(res.docs as Travel[])]);
            setLastDoc(res.lastVisible);
            setHasMore(res.docs.length === PAGE_SIZE);
        } catch (e) {
            console.log("Error loadMore AllPublicTravels:", e);
        } finally {
            setIsLoadingMore(false);
        }
    }, [hasMore, isLoadingMore, lastDoc, blackListIds]);

    return { travels, isLoading, isLoadingMore, hasMore, error, loadMore };
}