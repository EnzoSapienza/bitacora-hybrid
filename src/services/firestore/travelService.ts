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
} from 'firebase/firestore';
import { db } from '../firebase';

const COL = 'trips';
const COL2 = 'tripAccess';

export const travelService = {
    getAll: async (uid: string) => {
        const q = query(collection(db, COL), where('uid', '==', uid));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },

    getById: async (id: string) => {
        const snap = await getDoc(doc(db, COL, id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    create: (data: object) =>
        addDoc(collection(db, COL), data),

    update: (id: string, data: Partial<object>) =>
        updateDoc(doc(db, COL, id), data),

    remove: (id: string) =>
        deleteDoc(doc(db, COL, id)),

    // TODO: Lógica del acceso a viajes
};