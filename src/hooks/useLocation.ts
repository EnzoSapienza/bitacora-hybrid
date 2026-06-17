import { useState } from "react";

type LocationType = {
    latitude: number;
    longitude: number;
} | null;

export default function useLocation() {
    const [location, setLocation] = useState<LocationType>({ latitude: -35, longitude: -60 });
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    return { location, errorMsg, loading };
}