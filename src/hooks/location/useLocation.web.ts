import { useCallback, useEffect, useRef, useState } from "react";

type LocationType = {
    latitude: number;
    longitude: number;
    address: string;
} | null;


type GeocodedAddress = {
    street: string | null;
    streetNumber: string | null;
    name: string | null;
    city: string | null;
    subregion: string | null;
    region: string | null;
    country: string | null;
    isoCountryCode: string | null;
    postalCode: string | null;
    district: string | null;
    timezone: string | null;
    formattedAddress: string | null;
};

const GEOCODE_THRESHOLD = 0.005;

const GEO_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 150000,
    maximumAge: 10000,
};

function geoErrorToMessage(err: GeolocationPositionError): string {
    switch (err.code) {
        case err.PERMISSION_DENIED:
            return "Permiso de ubicación denegado";
        case err.POSITION_UNAVAILABLE:
            return "No se pudo determinar la ubicación. Verificá que el navegador tenga acceso a la ubicación (HTTPS o localhost) y que los servicios de ubicación del sistema estén activos.";
        case err.TIMEOUT:
            return "Tiempo de espera agotado al obtener la ubicación";
        default:
            return "Error al obtener la ubicación";
    }
}

async function getAddressFromCoords(
    latitude: number,
    longitude: number
): Promise<GeocodedAddress> {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        { headers: { "Accept-Language": "es" } }
    );
    const data = await res.json();
    const a = data.address ?? {};

    const city =
        a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? null;

    return {
        street: a.road ?? null,
        streetNumber: a.house_number ?? null,
        name: a.house_number && a.road
            ? `${a.house_number}`
            : a.road ?? null,
        city: city,
        subregion: a.county ?? a.state_district ?? null,
        region: a.state ?? null,
        country: a.country ?? null,
        isoCountryCode: a.country_code?.toUpperCase() ?? null,
        postalCode: a.postcode ?? null,
        district: a.suburb ?? a.neighbourhood ?? null,
        timezone: null,
        formattedAddress: data.display_name ?? null,
    };
}

function addressToString(lugar: GeocodedAddress, lat: number, lng: number): string {
    const calle = lugar.street || "";
    const numero = lugar.name || "";
    const ciudad = lugar.city || lugar.subregion || "";
    return calle
        ? `${calle} ${numero}${ciudad ? `, ${ciudad}` : ""}`.trim()
        : lugar.formattedAddress || `${lat}, ${lng}`;
}

function getCurrentPositionAsync(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            console.error("Geolocalización no soportada en este navegador");
            reject(new Error("Geolocalización no soportada en este navegador"));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, GEO_OPTIONS);
    });
}

function watchPositionWeb(
    onPosition: (pos: GeolocationPosition) => void,
    onError: (err: GeolocationPositionError) => void
): number | null {
    if (!navigator.geolocation) return null;
    return navigator.geolocation.watchPosition(onPosition, onError, GEO_OPTIONS);
}

export default function useLocation() {
    const [location, setLocation] = useState<LocationType>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const lastGeocodedRef = useRef<{ latitude: number; longitude: number } | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const isMountedRef = useRef(true);

    const startWatching = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        watchIdRef.current = watchPositionWeb(
            async (pos) => {
                if (!isMountedRef.current) return;
                const { latitude: lat, longitude: lon } = pos.coords;
                const last = lastGeocodedRef.current;
                const shouldGeocode =
                    !last ||
                    Math.abs(lat - last.latitude) > GEOCODE_THRESHOLD ||
                    Math.abs(lon - last.longitude) > GEOCODE_THRESHOLD;

                if (shouldGeocode) {
                    try {
                        const newAddressObj = await getAddressFromCoords(lat, lon);
                        if (!isMountedRef.current) return;
                        lastGeocodedRef.current = { latitude: lat, longitude: lon };
                        setLocation({ latitude: lat, longitude: lon, address: addressToString(newAddressObj, lat, lon) });
                    } catch (err) {
                        if (!isMountedRef.current) return;
                        setLocation((prev) => (prev ? { ...prev, latitude: lat, longitude: lon } : null));
                    }
                } else {
                    setLocation((prev) => (prev ? { ...prev, latitude: lat, longitude: lon } : null));
                }
            },
            (err) => {
                console.error("watchPosition error:", err);
            }
        );
    }, []);

    const requestPermissionAndGetLocation = useCallback(async () => {
        setLoading(true);
        setErrorMsg(null);
        console.group("requestPermissionAndGetLocation");
        try {

            const current = await getCurrentPositionAsync();

            const { latitude, longitude } = current.coords;

            if (!isMountedRef.current) return;


            let address = `${latitude}, ${longitude}`;
            try {
                const addressObj = await getAddressFromCoords(latitude, longitude);
                address = addressToString(addressObj, latitude, longitude);
            } catch (geocodeErr) {
                console.error("geocodeErr:", geocodeErr);
            }

            if (!isMountedRef.current) return;


            lastGeocodedRef.current = { latitude, longitude };
            setLocation({ latitude, longitude, address });
            setLoading(false);


            startWatching();
        } catch (err) {
            console.error("err:", err);
            if (isMountedRef.current) {
                const message =
                    err instanceof GeolocationPositionError
                        ? geoErrorToMessage(err)
                        : "Error al obtener la ubicación";
                setErrorMsg(message);
                setLoading(false);
            }
        } finally {

            console.groupEnd();
        }
    }, [startWatching]);

    useEffect(() => {
        isMountedRef.current = true;
        requestPermissionAndGetLocation();
        return () => {
            isMountedRef.current = false;
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
        };
    }, [requestPermissionAndGetLocation]);

    return { location, errorMsg, loading, refetch: requestPermissionAndGetLocation };
}