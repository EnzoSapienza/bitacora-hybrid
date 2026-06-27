import { db } from "../firebase";
import {
    collection, collectionGroup,
    addDoc, getDocs, doc, getDoc, updateDoc,
    query, orderBy, where, limit as fsLimit,
    increment,
    serverTimestamp,
    GeoPoint,
} from "firebase/firestore";
import { parseDateTimeToDate } from "../../components/utils/date";

interface PointData {
    name: string;
    address: string;
    notes: string;
    visitDate: string;
    visitTime: string;
    latitude: number;
    longitude: number;
    imageUrls: string[];
}

const RAW_FETCH_LIMIT = 200;

export const poiService = {
    getAllByTrip: async (tripId: string) => {
        const pointsRef = collection(db, "trips", tripId, "pointsOfInterest");
        const q = query(pointsRef, orderBy("visitDate", "asc"));
        const snap = await getDocs(q);

        return snap.docs.map((doc) => {
            const data = doc.data();

            let lat = 0;
            let lng = 0;
            if (data.location) {
                lat = data.location.latitude;
                lng = data.location.longitude;
            }

            let visitDate: Date | null = null;

            if (data.visitDate && typeof data.visitDate.toDate === "function") {
                visitDate = data.visitDate.toDate();
            }

            return {
                id: doc.id,
                name: data.name || "",
                address: data.address || "",
                notes: data.notes || "",
                visitDate,
                latitude: lat,
                longitude: lng,
                imageUrls: data.imageUrls || [],
            };
        });
    },

    getPointById: async (tripId: string, pointId: string) => {
        const pointRef = doc(db, "trips", tripId, "pointsOfInterest", pointId);
        const snap = await getDoc(pointRef);

        if (!snap.exists()) return null;

        const data = snap.data();
        let lat = 0;
        let lng = 0;
        if (data.location) {
            lat = data.location.latitude;
            lng = data.location.longitude;
        }

        let visitDate: Date | null = null;
        if (data.visitDate && typeof data.visitDate.toDate === "function") {
            visitDate = data.visitDate.toDate();
        }

        return {
            id: snap.id,
            name: data.name || "",
            address: data.address || "",
            notes: data.notes || "",
            visitDate,
            latitude: lat,
            longitude: lng,
            imageUrls: data.imageUrls || [],
        };
    },

    savePoint: async (tripId: string, pointData: PointData): Promise<string> => {
        const pointsCollectionRef = collection(db, "trips", tripId, "pointsOfInterest");
        const travelDocRef = doc(db, "trips", tripId);

        const parsedDate = parseDateTimeToDate(pointData.visitDate, pointData.visitTime);
        const customDate = parsedDate ?? serverTimestamp();

        const docRef = await addDoc(pointsCollectionRef, {
            name: pointData.name,
            address: pointData.address,
            notes: pointData.notes,
            visitDate: customDate,
            location: new GeoPoint(pointData.latitude, pointData.longitude),
            geohash: "",
            authorizedUsers: [],
            imageUrls: pointData.imageUrls
        });

        await updateDoc(travelDocRef, {
            pointsCount: increment(1),
            updatedAt: serverTimestamp()
        });

        return docRef.id;
    },

    getAuthorizedNearbyPoints: async (uid: string, range: [string, string]) => {
        const snap = await getDocs(
            query(
                collectionGroup(db, "pointsOfInterest"),
                where("authorizedUsers", "array-contains", uid),
                where("geohash", ">=", range[0]),
                where("geohash", "<=", range[1]),
                fsLimit(RAW_FETCH_LIMIT)
            )
        );

        return snap.docs.map((d) => {
            const data = d.data();

            return {
                id: d.id,
                tripId: d.ref.parent.parent?.id ?? null,

                lat: data.location.latitude,
                lng: data.location.longitude,

                name: data.name,
                address: data.address,
                notes: data.notes,
                imageUrls: data.imageUrls,
                visitDate: data.visitDate,
                authorizedUsers: data.authorizedUsers,
                geohash: data.geohash,
            };
        });
    }

};