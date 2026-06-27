import type { StyleProp, ViewStyle } from "react-native";
import type { LngLat } from "@maplibre/maplibre-react-native";

export default interface MapMarker {
    id: string;
    coords: LngLat;
    name?: string;
    address?: string;
    tripId?: string;
}