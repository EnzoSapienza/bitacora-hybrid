import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, increment, serverTimestamp, GeoPoint } from "firebase/firestore";
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

export const poiService = {
    getAllByTrip: async (tripId: string) => {
        const pointsRef = collection(db, "trips", tripId, "pointsOfInterest");
        const snap = await getDocs(pointsRef);
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
    }
};