import type { LngLat } from "@maplibre/maplibre-react-native";

export type ReverseGeocodeResult = {
    name: string;
    address: string;
};

export async function reverseGeocode(
    lngLat: LngLat
): Promise<ReverseGeocodeResult> {
    const [lng, lat] = lngLat;
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
        headers: { "Accept-Language": "es" },
    });

    if (!response.ok) {
        throw new Error("No se pudo obtener la dirección del lugar");
    }

    const data = await response.json();
    const name: string =
        data.name ||
        data.address?.road ||
        data.display_name?.split(",")[0] ||
        "Ubicación seleccionada";
    const address: string = data.display_name || "Dirección no disponible";

    return { name, address };
}