import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "../services/googleMapsLoader";

const DEFAULT_CENTER = { lat: -16.5, lng: -68.15 }; // La Paz, Bolivia

export default function AddressAutocompleteMap({ address, lat, lng, onChange }) {
    const inputRef = useRef(null);
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const [error, setError] = useState("");
    const [coords, setCoords] = useState(
        (typeof lat === "number" && typeof lng === "number") ? { lat, lng } : null
    );

    useEffect(() => {
        let cancelled = false;

        window.gm_authFailure = () => {
            if (!cancelled) setError("La API key de Google Maps no es valida o no tiene las APIs necesarias habilitadas.");
        };

        loadGoogleMaps()
            .then((maps) => {
                if (cancelled || !mapContainerRef.current) return;

                const hasInitialLocation = typeof lat === "number" && typeof lng === "number";
                const center = hasInitialLocation ? { lat, lng } : DEFAULT_CENTER;

                mapRef.current = new maps.Map(mapContainerRef.current, {
                    center,
                    zoom: hasInitialLocation ? 16 : 12,
                    disableDefaultUI: true,
                    zoomControl: true,
                });

                markerRef.current = new maps.Marker({
                    map: mapRef.current,
                    position: center,
                    draggable: true,
                });

                const geocoder = new maps.Geocoder();

                const moveMarkerTo = (newLat, newLng) => {
                    markerRef.current.setPosition({ lat: newLat, lng: newLng });
                    setCoords({ lat: newLat, lng: newLng });
                    geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, geoStatus) => {
                        if (geoStatus !== "OK" || !results?.[0]) {
                            onChange({ lat: newLat, lng: newLng });
                            return;
                        }
                        const newAddress = results[0].formatted_address;
                        if (inputRef.current) inputRef.current.value = newAddress;
                        onChange({ address: newAddress, lat: newLat, lng: newLng });
                    });
                };

                markerRef.current.addListener("dragend", () => {
                    const position = markerRef.current.getPosition();
                    moveMarkerTo(position.lat(), position.lng());
                });

                mapRef.current.addListener("click", (event) => {
                    moveMarkerTo(event.latLng.lat(), event.latLng.lng());
                });

                const autocomplete = new maps.places.Autocomplete(inputRef.current, {
                    fields: ["formatted_address", "geometry"],
                });

                autocomplete.addListener("place_changed", () => {
                    const place = autocomplete.getPlace();
                    if (!place.geometry?.location) return;
                    const newLat = place.geometry.location.lat();
                    const newLng = place.geometry.location.lng();
                    const newAddress = place.formatted_address || inputRef.current.value;
                    mapRef.current.setCenter({ lat: newLat, lng: newLng });
                    mapRef.current.setZoom(16);
                    markerRef.current.setPosition({ lat: newLat, lng: newLng });
                    setCoords({ lat: newLat, lng: newLng });
                    onChange({ address: newAddress, lat: newLat, lng: newLng });
                });
            })
            .catch(() => {
                if (!cancelled) setError("No se pudo cargar el mapa de Google.");
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div>
            <input
                ref={inputRef}
                type="text"
                className="form-control admin-input"
                placeholder="Busca la direccion..."
                defaultValue={address}
                onChange={(e) => onChange({ address: e.target.value })}
            />
            {error && <small className="text-danger d-block mt-1">{error}</small>}
            <div
                ref={mapContainerRef}
                style={{ height: 220, borderRadius: 12, marginTop: 8, overflow: "hidden", background: "#eee" }}
            />
            <small style={{ color: "var(--admin-muted)" }}>Haz clic en el mapa o arrastra el marcador para ajustar la ubicacion exacta.</small>
            {coords && (
                <div className="small fw-semibold mt-1" style={{ color: "var(--admin-text)" }}>
                    Lat: {coords.lat.toFixed(6)} · Lng: {coords.lng.toFixed(6)}
                </div>
            )}
        </div>
    );
}
