/**
 * Encapsula el CRUD de usuarios en Firestore.
 */
import { db } from "../firebase";
import { collection, doc, getDoc, getDocs, runTransaction, serverTimestamp, increment } from "firebase/firestore";

export const userService = {
    getPublicProfile: async (userId: string) => {
        const snap = await getDoc(doc(db, "users", userId));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    followUser: async (currentUserId: string, targetUserId: string) => {
        if (!currentUserId || !targetUserId) return;

        await runTransaction(db, async (transaction) => {
            const currentUserRef = doc(db, "users", currentUserId);
            const targetUserRef = doc(db, "users", targetUserId);
            const followRef = doc(db, "followers", currentUserId, "following", targetUserId);

            transaction.set(followRef, { createdAt: serverTimestamp() });
            transaction.update(currentUserRef, { followingCount: increment(1) });
            transaction.update(targetUserRef, { followersCount: increment(1) });
        });
    },

    unfollowUser: async (currentUserId: string, targetUserId: string) => {
        if (!currentUserId || !targetUserId) return;

        await runTransaction(db, async (transaction) => {
            const currentUserRef = doc(db, "users", currentUserId);
            const targetUserRef = doc(db, "users", targetUserId);
            const followRef = doc(db, "followers", currentUserId, "following", targetUserId);

            transaction.delete(followRef);
            transaction.update(currentUserRef, { followingCount: increment(-1) });
            transaction.update(targetUserRef, { followersCount: increment(-1) });
        });
    },

    isFollowing: async (currentUserId: string, targetUserId: string) => {
        if (!currentUserId || !targetUserId) return false;
        const followRef = doc(db, "followers", currentUserId, "following", targetUserId);
        const snap = await getDoc(followRef);
        return snap.exists();
    },

    getFollowingIds: async (currentUserId: string) => {
        if (!currentUserId) return [];
        const followingCol = collection(db, "followers", currentUserId, "following");
        const snap = await getDocs(followingCol);
        return snap.docs.map(doc => doc.id);
    }
};