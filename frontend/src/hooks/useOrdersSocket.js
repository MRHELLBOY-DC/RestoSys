import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getEnv } from "../services/apiClient";

const API_GATEWAY = getEnv("VITE_API_GATEWAY_URL", "http://localhost:8080");

// Subscribes to real-time order updates for the logged-in client instead of polling the REST API.
export function useOrdersSocket({ enabled, onConnect, onOrderUpdate }) {
    const onConnectRef = useRef(onConnect);
    const onOrderUpdateRef = useRef(onOrderUpdate);

    useEffect(() => {
        onConnectRef.current = onConnect;
        onOrderUpdateRef.current = onOrderUpdate;
    }, [onConnect, onOrderUpdate]);

    useEffect(() => {
        if (!enabled) return undefined;
        const token = localStorage.getItem("token");
        if (!token) return undefined;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${API_GATEWAY}/ws`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe("/user/queue/orders", (message) => {
                    try {
                        onOrderUpdateRef.current(JSON.parse(message.body));
                    } catch {
                        // ignore malformed payload
                    }
                });
                onConnectRef.current?.();
            },
        });

        client.activate();
        return () => {
            client.deactivate();
        };
    }, [enabled]);
}
