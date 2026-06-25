// Driving-route helper used to draw the "vendor → user" road on the map
// (ride-sharing style). Uses the public OSRM demo server, which needs no API
// key — consistent with the OSM/Nominatim geocoding already used in the app.
//
// Returns { coordinates: [{latitude, longitude}], distance (m), duration (s), isFallback }.
// If the routing service is unreachable it falls back to a straight line so the
// map always shows a connecting path between the two points.

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

export const haversineMeters = (a, b) => {
    const R = 6371000;
    const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
    const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
    const lat1 = (a.latitude * Math.PI) / 180;
    const lat2 = (b.latitude * Math.PI) / 180;
    const h =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const fetchRoute = async (origin, destination) => {
    const fallback = {
        coordinates: [
            { latitude: origin.latitude, longitude: origin.longitude },
            { latitude: destination.latitude, longitude: destination.longitude },
        ],
        distance: haversineMeters(origin, destination),
        duration: null,
        isFallback: true,
    };

    try {
        const url =
            `${OSRM_BASE}/${origin.longitude},${origin.latitude};` +
            `${destination.longitude},${destination.latitude}` +
            `?overview=full&geometries=geojson`;
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        const data = await res.json();
        if (data && data.code === 'Ok' && data.routes && data.routes.length) {
            const route = data.routes[0];
            const coordinates = (route.geometry?.coordinates || []).map(([lng, lat]) => ({
                latitude: lat,
                longitude: lng,
            }));
            if (coordinates.length >= 2) {
                return {
                    coordinates,
                    distance: route.distance,
                    duration: route.duration,
                    isFallback: false,
                };
            }
        }
    } catch (_) {
        // network / service error — fall through to straight line
    }
    return fallback;
};

// "3.2 km · ~8 min away" — duration omitted when only the fallback is available.
export const formatEta = (distanceMeters, durationSeconds) => {
    if (distanceMeters == null) return '';
    const km = (distanceMeters / 1000).toFixed(1);
    if (durationSeconds == null) return `${km} km away`;
    const mins = Math.max(1, Math.round(durationSeconds / 60));
    return `${km} km · ~${mins} min away`;
};
