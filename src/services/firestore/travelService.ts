/**
 * Encapsula el CRUD de viajes
 */

import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    limit,
    startAfter,
    orderBy,
    writeBatch,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const COL = 'trips';

const mapTravelDoc = (d: any) => {
    const data = d.data();
    return {
        id: d.id,
        ...data,
        startDate: data.startDate?.toDate ? data.startDate.toDate() : data.startDate,
        endDate: data.endDate?.toDate ? data.endDate.toDate() : data.endDate,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
    };
};

export const travelService = {
    getAll: async (uid: string) => {
        const q = query(
            collection(db, COL),
            where('ownerId', '==', uid),
            orderBy('updatedAt', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },

    getById: async (id: string) => {
        const snap = await getDoc(doc(db, COL, id));
        return snap.exists() ? mapTravelDoc(snap) : null;
    },

    create: (data: object) =>
        addDoc(collection(db, COL), data),

    update: (id: string, data: Partial<object>) =>
        updateDoc(doc(db, COL, id), data),

    remove: (id: string) =>
        deleteDoc(doc(db, COL, id)),

    // Públicos / Descubrimiento
    getPublicTravels: async (
        limitCount: number = 10,
        lastVisibleDoc?: any,
        blackListIds: string[] = []
    ) => {
        let results: any[] = [];
        let currentLastDoc = lastVisibleDoc;

        while (results.length < limitCount) {
            let q = query(
                collection(db, COL),
                where('visibility', '==', 'public'),
                orderBy('updatedAt', 'desc'),
                limit(limitCount * 2)
            );
            if (currentLastDoc) q = query(q, startAfter(currentLastDoc));

            const snap = await getDocs(q);
            if (snap.empty) break;

            currentLastDoc = snap.docs[snap.docs.length - 1];

            const pageItems = snap.docs
                .map(mapTravelDoc)
                .filter((t: any) => !blackListIds.includes(t.ownerId));

            results = [...results, ...pageItems];

            if (snap.docs.length < limitCount * 2) break;
        }

        if (results.length > limitCount) {
            results = results.slice(0, limitCount);
        }

        return { docs: results, lastVisible: currentLastDoc };
    },

    getFollowingTravels: async (followingIds: string[], limitCount: number = 10, lastVisibleDoc?: any) => {
        if (!followingIds || followingIds.length === 0) return { docs: [], lastVisible: null };
        let q = query(
            collection(db, COL),
            where('ownerId', 'in', followingIds.slice(0, 10)),
            where('visibility', 'in', ['public', 'followers']),
            orderBy('updatedAt', 'desc'),
            limit(limitCount)
        );
        if (lastVisibleDoc) q = query(q, startAfter(lastVisibleDoc));
        const snap = await getDocs(q);
        return {
            docs: snap.docs.map(mapTravelDoc),
            lastVisible: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null
        };
    },

    getFilteredTravels: async (
        uid: string,
        limitCount: number = 10,
        lastVisibleDoc?: any,
        searchQuery?: string,
        durationFilter?: string | null,
        isDetailedOnly?: boolean,
        selectedMonth?: number | null,
        selectedYear?: number | null
    ) => {
        let q = query(collection(db, COL), where('visibility', '==', 'public'));

        if (searchQuery && searchQuery.trim() !== '') {
            const end = searchQuery + '\uf8ff';
            q = query(q, where('name', '>=', searchQuery), where('name', '<=', end));
        }


        if (durationFilter === 'SHORT') {
            q = query(q,
                where('durationDays', '>=', 1),
                where('durationDays', '<=', 3),
                orderBy('durationDays', 'asc')
            );
        } else if (durationFilter === 'MEDIUM') {
            q = query(q,
                where('durationDays', '>=', 4),
                where('durationDays', '<=', 7),
                orderBy('durationDays', 'asc')
            );
        } else if (durationFilter === 'LONG') {
            q = query(q,
                where('durationDays', '>', 7),
                orderBy('durationDays', 'asc')
            );
        } else if (isDetailedOnly) {
            q = query(q,
                where('pointsCount', '>=', 5),
                orderBy('pointsCount', 'desc')
            );
        } else if (selectedMonth != null) {
            const year = selectedYear || new Date().getFullYear();
            const firstDay = new Date(year, selectedMonth - 1, 1);
            const lastDay = new Date(year, selectedMonth, 0, 23, 59, 59);
            q = query(q,
                where('startDate', '>=', firstDay),
                where('startDate', '<=', lastDay),
                orderBy('updatedAt', 'desc')
            );
        } else if (searchQuery && searchQuery.trim() !== '') {
            q = query(q, orderBy('name'));
        } else {
            q = query(q, orderBy('updatedAt', 'desc'));
        }

        q = query(q, limit(limitCount));
        if (lastVisibleDoc) q = query(q, startAfter(lastVisibleDoc));

        const snap = await getDocs(q);
        const travels = snap.docs
            .map(mapTravelDoc)
            .filter((t: any) => t.ownerId !== uid);

        return {
            docs: travels,
            lastVisible: snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null
        };
    },

    getPublicUserTravels: async (userId: string, viewerFollowsOwner: boolean = false) => {
        const visibilities = viewerFollowsOwner ? ['public', 'followers'] : ['public'];
        const q = query(
            collection(db, COL),
            where('ownerId', '==', userId),
            where('visibility', 'in', visibilities),
            orderBy('updatedAt', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(mapTravelDoc);
    },

    syncTripAccess: async (tripId: string, newPrivileges: string[], removed: string[]) => {
        const batch = writeBatch(db);

        removed.forEach((uid) => {
            batch.delete(doc(db, 'tripAccess', uid, 'trips', tripId));
        });

        newPrivileges.forEach((uid) => {
            batch.set(doc(db, 'tripAccess', uid, 'trips', tripId), { addedAt: serverTimestamp() });
        });

        await batch.commit();
    },

    getSharedTripIds: async (userId: string) => {
        const snap = await getDocs(collection(db, 'tripAccess', userId, 'trips'));
        return snap.docs.map((d) => d.id);
    },

    getSharedTravels: async (userId: string) => {
        const tripIds = await travelService.getSharedTripIds(userId);
        if (tripIds.length === 0) return [];

        const results = await Promise.allSettled(
            tripIds.map((id) => getDoc(doc(db, COL, id)))
        );

        return results
            .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value.exists())
            .map((r) => mapTravelDoc(r.value))
            .sort((a, b) => {
                const aTime = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
                const bTime = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
                return bTime - aTime;
            });
    }
};