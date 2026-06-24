export default interface PointOfInterest {
    id: string;
    name: string;
    address: string;
    notes: string;
    visitDate: Date | null;
    latitude: number;
    longitude: number;
    imageUrls: string[];
}