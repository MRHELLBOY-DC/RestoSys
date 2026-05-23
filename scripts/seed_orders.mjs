const ORDERS_API = process.env.ORDERS_API || "http://localhost:8002";

const parseArgs = () => {
    const args = process.argv.slice(2);
    const getValue = (flag) => {
        const index = args.indexOf(flag);
        if (index === -1) return null;
        return args[index + 1] || null;
    };
    return {
        restaurantId: getValue("--restaurant-id"),
        count: Number(getValue("--count") || 5),
    };
};

const request = async (path, options = {}) => {
    const res = await fetch(`${ORDERS_API}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || "Request failed");
    }
    return res.json();
};

const createOrderPayload = (restaurantId, index) => ({
    restaurantId,
    type: index % 2 === 0 ? "MESA" : "PICKUP",
    tableNumber: index % 2 === 0 ? `M-${index + 1}` : null,
    items: [
        {
            productId: crypto.randomUUID(),
            productName: `Producto ${index + 1}`,
            quantity: 1 + (index % 3),
            unitPrice: 12.5 + index,
            options: [],
        },
        {
            productId: crypto.randomUUID(),
            productName: `Extra ${index + 1}`,
            quantity: 1,
            unitPrice: 5.25,
            options: [],
        },
    ],
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
    const { restaurantId, count } = parseArgs();
    if (!restaurantId) {
        console.error("Usa: node scripts/seed_orders.mjs --restaurant-id <UUID> [--count 5]");
        process.exit(1);
    }

    console.log(`Creando ${count} pedidos para restaurantId ${restaurantId}`);

    for (let i = 0; i < count; i += 1) {
        const order = await request("/api/orders", {
            method: "POST",
            body: JSON.stringify(createOrderPayload(restaurantId, i)),
        });

        if (i % 3 === 1) {
            await request(`/api/orders/${order.id}/confirm-payment`, { method: "PATCH" });
        }
        if (i % 3 === 2) {
            await request(`/api/orders/${order.id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: "PREPARANDO" }),
            });
            await sleep(100);
            await request(`/api/orders/${order.id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: "LISTO" }),
            });
        }

        console.log(`Pedido creado: ${order.orderCode} (${order.id})`);
    }
};

run().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
