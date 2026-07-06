import { getEnv } from "./apiClient";

let loadPromise = null;

export function loadGoogleMaps() {
    if (window.google?.maps) {
        return Promise.resolve(window.google.maps);
    }
    if (loadPromise) {
        return loadPromise;
    }

    const apiKey = getEnv("VITE_GOOGLE_MAPS_API_KEY", "");

    loadPromise = new Promise((resolve, reject) => {
        const callbackName = "__googleMapsLoaderCallback";
        window[callbackName] = () => {
            delete window[callbackName];
            resolve(window.google.maps);
        };

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
            loadPromise = null;
            reject(new Error("No se pudo cargar el script de Google Maps"));
        };
        document.head.appendChild(script);
    });

    return loadPromise;
}
