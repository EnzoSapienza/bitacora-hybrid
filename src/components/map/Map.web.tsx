import { View, Text, StyleSheet } from "react-native";
import MapMarker from "@/types/models/MapMarker";

type Props = {
    initialCenter?: [number, number];
    initialZoom?: number;
    markers?: MapMarker[];
    onMarker?: (marker: MapMarker) => void;
    clickable?: boolean;
    onNewMarker?: (marker: MapMarker) => void;
    userLocation?: [number, number] | null;
    showUserLocation?: boolean;
    followUserLocation?: boolean;
    onViewportChange?: (
        center: { lat: number; lng: number },
        bounds: { north: number; south: number; east: number; west: number },
    ) => void;
    interactive?: boolean;
};

export default function MapOSM(_props: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                El mapa interactivo está disponible en la app móvil.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#f0f0f0",
    },
    text: { textAlign: "center", color: "#555" },
});
