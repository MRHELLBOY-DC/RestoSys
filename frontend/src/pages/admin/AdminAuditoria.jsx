import { useEffect, useState } from "react";
import AdminShell from "../../components/AdminShell";
import { useAuth } from "../../hooks/useAuth";
import { getAuditLogs } from "../../services/reportsApi";
import { getAdminRestaurantes, getAdminUsuarios } from "../../services/api";

const getErrorMessage = (err, fallback) => err?.data?.detail || err?.data?.message || err?.message || fallback;

const parseJson = (value) => {
    if (!value) return null;
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

const parseDetail = (detail) => {
    const root = parseJson(detail) || {};
    const data = parseJson(root.data) || root.data || {};
    return { root, data };
};

const shortId = (value) => {
    if (!value) return "";
    const clean = value.toString();
    return clean.length > 8 ? clean.slice(0, 8) : clean;
};

const formatTimeAgo = (value) => {
    if (!value) return "fecha no registrada";
    const timestamp = new Date(value).getTime();
    if (Number.isNaN(timestamp)) return "fecha no registrada";
    const minutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));
    if (minutes < 60) return `hace ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${Math.floor(hours / 24)}d`;
};

const sourceLabel = (source) => {
    const labels = {
        "payments-billing": "Sistema de pagos",
        "payments-billing-service": "Sistema de pagos",
        "orders-service": "Servicio de pedidos",
        "menu-service": "Gestion de menu",
        "auth-service": "Usuarios y acceso",
        system: "Sistema",
    };
    return labels[source] || source || "Sistema";
};

const toUUID = (id) => `00000000-0000-0000-0000-${String(id).padStart(12, "0")}`;

const getActor = (log, restaurantMap = new Map(), clientMap = new Map()) => {
    const { root, data } = parseDetail(log.detail);
    const clientId = data.client_id || data.clientId || root.client_id || root.clientId;
    const isPaymentEvent = log.action === "PAYMENT_CONFIRMED" || log.action === "PaymentConfirmed";

    const isOrderCreated = log.action === "OrderCreated";

    if ((isPaymentEvent || isOrderCreated) && clientId) {
        const clientName = clientMap.get(clientId);
        if (clientName) return clientName;
        return `Cliente ${shortId(clientId)}`;
    }

    // actor_username set by new menu/order events
    if (data.actor_username) return data.actor_username;

    // For menu/orders events resolve restaurant name via restaurantId
    const isMenuOrOrderSource = log.source === "menu-service" || log.source === "orders-service";
    if (isMenuOrOrderSource && log.restaurantId) {
        const name = restaurantMap.get(log.restaurantId);
        if (name) return name;
    }

    // Auth/user events carry the actor in well-known fields
    return data.actor
        || data.email
        || data.username
        || data.identifier
        || sourceLabel(log.source);
};

const roleLabel = (role) => ({ admin: "administrador", restaurante: "restaurante", cliente: "cliente" }[role] || role);

const getAction = (log, restaurantMap = new Map()) => {
    const { root, data } = parseDetail(log.detail);
    const action = (log.action || "").toString();
    const name = data.name || data.product_name || data.category_name || data.username || data.email || "";
    const orderId = data.orderCode || data.order_code || data.order_id || data.orderId || root.order_id || root.orderId || data.aggregateId || "";
    const restaurantStatus = data.status || data.restaurant_status || root.status || root.restaurant_status;
    const isRestaurantPaused = restaurantStatus === "paused" || restaurantStatus === "inactive" || data.is_active === false;
    const hasPrice = typeof data.price !== "undefined" || typeof data.new_price !== "undefined" || typeof data.price_after !== "undefined";
    const restaurantName = restaurantMap.get(log.restaurantId) || "";

    if (action === "UserUpdated") {
        const oldRole = data.old_data?.role;
        const newRole = data.new_data?.role;
        if (oldRole && newRole && oldRole !== newRole) {
            return `actualizó usuario ${name} de ${roleLabel(oldRole)} a ${roleLabel(newRole)}`.trim();
        }
        const oldUsername = data.old_data?.username;
        const newUsername = data.new_data?.username;
        if (oldUsername && newUsername && oldUsername !== newUsername) {
            return `renombró usuario ${oldUsername} a ${newUsername}`;
        }
        return `actualizó usuario ${name}`.trim();
    }

    const actions = {
        UserCreated: `creó usuario ${name}`.trim(),
        UserUpdated: `actualizó usuario ${name}`.trim(),
        UserDeleted: `eliminó usuario ${name}`.trim(),
        "auth.login.success": "inició sesión",
        "auth.login.failed": "intentó iniciar sesión (fallido)",
        "restaurant.created": `aprobó alta de ${name}`.trim(),
        "restaurant.updated": isRestaurantPaused ? `pausó restaurante ${name}`.trim() : `modificó restaurante ${name}`.trim(),
        "restaurant.deleted": `eliminó restaurante ${name}`.trim(),
        "category.created": `creó categoría '${name || "sin nombre"}'`,
        "category.updated": `modificó categoría '${name || "sin nombre"}'`,
        "category.deleted": `eliminó categoría '${name || "sin nombre"}'`,
        "product.created": `creó producto ${name}`.trim(),
        "product.updated": hasPrice ? `modificó precio de ${name}`.trim() : `modificó producto ${name}`.trim(),
        "product.deleted": `eliminó producto ${name}`.trim(),
        "option.created": `creó opción ${name}`.trim(),
        "option.updated": `actualizó opción ${name}`.trim(),
        "option.deleted": `eliminó opción ${name}`.trim(),
        OrderCreated: `creó pedido${orderId ? ` ${shortId(orderId)}` : ""}${restaurantName ? ` en ${restaurantName}` : ""}`.trim(),
        OrderStatusChanged: (() => {
            const prev = data.previousStatus || "";
            const next = data.newStatus || "";
            const statusLabel = { RECIBIDO: "recibido", PREPARANDO: "preparando", LISTO: "listo", ENTREGADO: "entregado", CANCELADO: "cancelado" };
            const transition = prev && next ? ` de ${statusLabel[prev] || prev} a ${statusLabel[next] || next}` : "";
            return orderId ? `cambió estado del pedido ${shortId(orderId)}${transition}` : `cambió estado de pedido${transition}`;
        })(),
        OrderPaid: orderId ? `marcó pagado el pedido ${shortId(orderId)}` : "marcó pedido como pagado",
        PAYMENT_CONFIRMED: orderId ? `confirmó pago del pedido ${shortId(orderId)}` : "confirmó un pago",
        PaymentConfirmed: orderId ? `confirmó pago del pedido ${shortId(orderId)}` : "confirmó un pago",
    };

    return actions[action] || action.replace(/[_\.]/g, " ").toLowerCase() || "registró una acción";
};

const getInitial = (actor) => {
    if (!actor) return "S";
    return actor.toString().trim().slice(0, 1).toUpperCase();
};

const getAvatarStyle = (actor) => {
    const palette = [
        { bg: "rgba(106, 212, 95, 0.18)", fg: "#7ed957" },
        { bg: "rgba(230, 75, 60, 0.18)", fg: "#ff6b54" },
        { bg: "rgba(244, 183, 68, 0.18)", fg: "#f4b744" },
        { bg: "rgba(126, 217, 87, 0.18)", fg: "#9ae6a0" },
        { bg: "rgba(141, 84, 255, 0.18)", fg: "#c7a8ff" },
        { bg: "rgba(97, 218, 251, 0.18)", fg: "#7bd3f7" },
    ];
    const seed = (actor || "system").split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const index = seed % palette.length;
    return { backgroundColor: palette[index].bg, color: palette[index].fg };
};

const toDisplayLog = (log, restaurantMap, clientMap) => {
    const actor = getActor(log, restaurantMap, clientMap);
    return {
        ...log,
        actor,
        actionText: getAction(log, restaurantMap),
        initial: getInitial(actor),
        time: formatTimeAgo(log.occurredAt),
        sourceText: sourceLabel(log.source),
    };
};

export default function AdminAuditoria() {
    const { user, loading } = useAuth(["admin"]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [restaurantMap, setRestaurantMap] = useState(new Map());
    const [clientMap, setClientMap] = useState(new Map());
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const loadData = async () => {
        setBusy(true);
        setError("");
        try {
            const [logs, restaurants, usuarios] = await Promise.all([
                getAuditLogs(),
                getAdminRestaurantes().catch(() => []),
                getAdminUsuarios().catch(() => []),
            ]);
            setAuditLogs(logs);
            setRestaurantMap(new Map((Array.isArray(restaurants) ? restaurants : []).map(r => [toUUID(r.id), r.name])));
            setClientMap(new Map((Array.isArray(usuarios) ? usuarios : []).map(u => [
                toUUID(u.id),
                u.full_name || u.username || u.email,
            ])));
        } catch (err) {
            setError(getErrorMessage(err, "No se pudieron cargar los eventos"));
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="d-flex align-items-center gap-2">
                    <div className="spinner-border" role="status"></div>
                    <p className="mb-0 fw-bold">Cargando auditoria...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <AdminShell
            title="Auditoria"
            subtitle="Registro de acciones en la plataforma"
            actions={(
                <button className="admin-btn admin-btn-primary" onClick={loadData} disabled={busy}>
                    Actualizar
                </button>
            )}
        >
            {error && <div className="alert alert-danger border-0 bg-danger bg-opacity-25 text-white">{error}</div>}

            <div className="admin-card admin-card--glass">
                {auditLogs.length === 0 ? (
                    <div className="admin-surface text-center text-white-50">
                        <p className="mb-0">No hay eventos de auditoria.</p>
                    </div>
                ) : (
                    <div className="admin-audit-list" style={{ maxHeight: "560px", overflowY: "auto" }}>
                        {auditLogs.map(log => toDisplayLog(log, restaurantMap, clientMap)).map((log) => (
                            <div key={log.id} className="admin-audit-item">
                                <div className="admin-audit-avatar" style={getAvatarStyle(log.actor)}>
                                    {log.initial}
                                </div>
                                <div className="admin-audit-body">
                                    <div className="admin-audit-title">
                                        <span className="fw-semibold">{log.actor}</span>{" "}
                                        {log.actionText}
                                    </div>
                                    <div className="admin-audit-meta">
                                        <span className="admin-audit-badge">{log.sourceText}</span>
                                        <span>{log.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminShell>
    );
}
