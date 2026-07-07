import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "../services/googleMapsLoader";

export default function RouteMap({ origin, destination, originLabel = "Restaurante", destinationLabel = "Cliente" }) {
    const mapContainerRef = useRef(null);
    const [error, setError] = useState("");
    const [routeInfo, setRouteInfo] = useState(null);

    const hasCoords = origin?.lat != null && origin?.lng != null && destination?.lat != null && destination?.lng != null;

    useEffect(() => {
        if (!hasCoords) return;
        let cancelled = false;

        window.gm_authFailure = () => {
            if (!cancelled) setError("La API key de Google Maps no es valida o no tiene las APIs necesarias habilitadas.");
        };

        let animationInterval = null;

        loadGoogleMaps()
            .then((maps) => {
                if (cancelled || !mapContainerRef.current) return;

                const map = new maps.Map(mapContainerRef.current, {
                    center: origin,
                    zoom: 13,
                    disableDefaultUI: true,
                    zoomControl: true,
                });

                const directionsService = new maps.DirectionsService();
                const directionsRenderer = new maps.DirectionsRenderer({ map, suppressMarkers: true });

                new maps.Marker({
                    position: origin,
                    map,
                    label: { text: "🏪", fontSize: "18px" },
                    title: originLabel,
                });
                new maps.Marker({
                    position: destination,
                    map,
                    label: { text: "📍", fontSize: "18px" },
                    title: destinationLabel,
                });

                directionsService.route(
                    {
                        origin,
                        destination,
                        travelMode: maps.TravelMode.DRIVING,
                    },
                    (result, routeStatus) => {
                        if (cancelled) return;
                        if (routeStatus !== "OK" || !result) {
                            setError("No se pudo calcular la ruta.");
                            return;
                        }
                        directionsRenderer.setDirections(result);
                        const leg = result.routes[0]?.legs[0];
                        if (leg) {
                            setRouteInfo({ distance: leg.distance?.text, duration: leg.duration?.text });
                        }

                        const path = result.routes[0]?.overview_path || [];
                        if (path.length > 1) {
                            const vehicleMarker = new maps.Marker({
                                position: path[0],
                                map,
                                label: { text: "🛵", fontSize: "20px" },
                                zIndex: 999,
                            });

                            const ANIMATION_DURATION_MS = 12000;
                            const stepMs = ANIMATION_DURATION_MS / path.length;
                            let index = 0;
                            animationInterval = setInterval(() => {
                                index += 1;
                                if (index >= path.length) {
                                    clearInterval(animationInterval);
                                    animationInterval = null;
                                    return;
                                }
                                vehicleMarker.setPosition(path[index]);
                            }, stepMs);
                        }
                    }
                );
            })
            .catch(() => {
                if (!cancelled) setError("No se pudo cargar el mapa de Google.");
            });

        return () => {
            cancelled = true;
            if (animationInterval) clearInterval(animationInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng]);

    if (!hasCoords) {
        return <p className="text-muted small mb-0">No hay coordenadas suficientes para trazar la ruta.</p>;
    }

    return (
        <div>
            <div
                ref={mapContainerRef}
                style={{ width: "100%", height: 260, borderRadius: 12, overflow: "hidden", background: "#eee" }}
            />
            {error && <small className="text-danger d-block mt-1">{error}</small>}
            {routeInfo && (
                <div className="d-flex gap-3 mt-2 small">
                    <span><strong>{originLabel}</strong> → <strong>{destinationLabel}</strong></span>
                    <span>{routeInfo.distance}</span>
                    <span>{routeInfo.duration}</span>
                </div>
            )}
        </div>
    );
}
