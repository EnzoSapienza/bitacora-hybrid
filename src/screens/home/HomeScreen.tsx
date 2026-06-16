import TravelList from "@/components/travel/travel_list/TravelList";
import Travel from "@/types/models/travel";
import { StyleSheet, FlatList } from "react-native";

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
    subtitle: { fontSize: 16, color: "#666" },
});

export default function HomeScreen() {
    // TODO: Llamar a un hook en vez de esto (mover los placehodlers si hace falta)
    const travels: Travel[] = [
        {
            id: "1",
            description: "Un viaje increíble a la playa con amigos.",
            ownerId: "user123",
            name: "Viaje a la playa",
            imageUrl: "https://placehold.net/default.png",
            startDate: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
            pointsCount: 100,
            updatedAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            durationDays: 14,
            privileges: null,
            visibility: "PUBLIC",
        },
        {
            id: "2",
            description: "Otro viaje emocionante a la montaña.",
            ownerId: "user456",
            name: "Viaje a la montaña",
            imageUrl: "https://placehold.net/default.png",
            startDate: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
            pointsCount: 150,
            updatedAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            durationDays: 14,
            privileges: null,
            visibility: "PUBLIC",
        },
        {
            id: "3",
            description: "Un viaje increíble a la selva.",
            ownerId: "user789",
            name: "Viaje a la selva",
            imageUrl: "https://placehold.net/default.png",
            startDate: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
            pointsCount: 200,
            updatedAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            durationDays: 14,
            privileges: null,
            visibility: "PUBLIC",
        },
    ];

    return (
        <TravelList
            travels={travels}
            onPressItem={(item) => console.log("Viajar a: " + item.id)}
        />
    );
}
