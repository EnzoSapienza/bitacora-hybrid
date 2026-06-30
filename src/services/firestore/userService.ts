/**
 * Encapsula el CRUD de usuarios en Firestore.
 */
import { db } from "../firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    runTransaction,
    serverTimestamp,
    increment,
    query,
    where,
    documentId,
    setDoc
} from "firebase/firestore";

export const userService = {
    createUserProfile: async (uid: string, data: { nombre: string; email: string }) => {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            nombre: data.nombre,
            email: data.email,
            createdAt: serverTimestamp()
        }, { merge: true });
    },

    saveUsername: async (uid: string, username: string) => {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            username: username.toLowerCase(),
        }, { merge: true });
    },
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
    },

    searchUsers: async (text: string) => {
        if (!text || text.trim().length === 0) return [];
        const qText = text.toLowerCase();
        const q = query(
            collection(db, "users"),
            where("username", ">=", qText),
            where("username", "<=", qText + "\uf8ff")
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    getUsersByIds: async (uids: string[]) => {
        if (!uids || uids.length === 0) return [];
        const q = query(collection(db, "users"), where(documentId(), "in", uids));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
    isUsernameAvailable: async (username: string) => {
        const q = query(
            collection(db, "users"),
            where("username", "==", username.toLowerCase())
        );
        const snap = await getDocs(q);
        return snap.empty;
    },
    updateProfile: async (uid: string, data: { nombre?: string; username?: string; photoUrl?: string; bio?: string }) => {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, data, { merge: true });
    },
};