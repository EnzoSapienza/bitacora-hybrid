const BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

export function encodeGeohash(lat: number, lng: number, precision = 10): string {
    const latRange: [number, number] = [-90, 90];
    const lngRange: [number, number] = [-180, 180];
    let isEven = true;
    let bit = 0;
    let ch = 0;
    let geohash = "";

    while (geohash.length < precision) {
        if (isEven) {
            const mid = (lngRange[0] + lngRange[1]) / 2;
            if (lng > mid) {
                ch |= 1 << (4 - bit);
                lngRange[0] = mid;
            } else {
                lngRange[1] = mid;
            }
        } else {
            const mid = (latRange[0] + latRange[1]) / 2;
            if (lat > mid) {
                ch |= 1 << (4 - bit);
                latRange[0] = mid;
            } else {
                latRange[1] = mid;
            }
        }

        isEven = !isEven;
        if (bit < 4) {
            bit++;
        } else {
            geohash += BASE32[ch];
            bit = 0;
            ch = 0;
        }
    }
    return geohash;
}

export function getSearchRange(lat: number, lng: number, radiusKm: number): [string, string] {
    const precision =
        radiusKm <= 0.05 ? 9 :
            radiusKm <= 0.5 ? 7 :
                radiusKm <= 5.0 ? 5 :
                    radiusKm <= 50.0 ? 4 : 3;

    const hash = encodeGeohash(lat, lng, precision);
    return [hash, hash + "\uf8ff"];
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}