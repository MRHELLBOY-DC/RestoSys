import { getEnv } from "./apiClient";

const MEDIA_BASE_URL = getEnv("VITE_MEDIA_BASE_URL", getEnv("VITE_API_GATEWAY_URL", "http://localhost:8080"));

function toGatewayMediaUrl(path, prefix) {
    if (!path) return "";

    let mediaPath = String(path);
    if (/^https?:\/\//i.test(mediaPath)) {
        const url = new URL(mediaPath);
        mediaPath = `${url.pathname}${url.search}`;
    }

    if (mediaPath.startsWith(prefix)) {
        return `${MEDIA_BASE_URL}${mediaPath}`;
    }

    if (mediaPath.startsWith("/media/")) {
        return `${MEDIA_BASE_URL}${prefix}${mediaPath.slice("/media".length)}`;
    }

    const normalizedPath = mediaPath.startsWith("/") ? mediaPath : `/${mediaPath}`;
    return `${MEDIA_BASE_URL}${prefix}${normalizedPath}`;
}

export const authMediaUrl = (path) => toGatewayMediaUrl(path, "/auth-media");
export const menuMediaUrl = (path) => toGatewayMediaUrl(path, "/menu-media");