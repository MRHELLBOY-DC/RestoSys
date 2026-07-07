import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../../components/Navbar";
import { getCurrentUser } from "../../services/api";
import { createOrder } from "../../services/ordersApi";
import { createPayment, simulateQrPayment, getReceiptUrl } from "../../services/paymentsApi";
import AddressAutocompleteMap from "../../components/AddressAutocompleteMap";
import "../../styles/client-theme.css";

const toUUID = (id) => `00000000-0000-0000-0000-${String(id).padStart(12, '0')}`;

export default function Carrito() {
    const { user, loading } = useAuth(['cliente']);
    const navigate = useNavigate();

    const getCartKey = (u) => u?.id ? `carrito_${u.id}` : "carrito_guest";

    const [carrito, setCarrito] = useState(() => {
        const currentUser = getCurrentUser();
        const stored = localStorage.getItem(getCartKey(currentUser));
        return stored ? JSON.parse(stored) : [];
    });

    const [orderType, setOrderType] = useState('MESA');
    const [tableNumber, setTableNumber] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryLat, setDeliveryLat] = useState(null);
    const [deliveryLng, setDeliveryLng] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CAJA');
    const [submitting, setSubmitting] = useState(false);

    const [qrOrder, setQrOrder] = useState(null);
    const [confirmingQr, setConfirmingQr] = useState(false);
    const [qrDone, setQrDone] = useState(false);

    useEffect(() => {
        if (!user) return;
        const stored = localStorage.getItem(getCartKey(user));
        setCarrito(stored ? JSON.parse(stored) : []);
    }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRemoveFromCart = (productId) => {
        const updated = carrito.filter(item => item.id !== productId);
        setCarrito(updated);
        localStorage.setItem(getCartKey(user), JSON.stringify(updated));
    };

    const handleUpdateQuantity = (productId, qty) => {
        if (qty < 1) { handleRemoveFromCart(productId); return; }
        const updated = carrito.map(item => item.id === productId ? { ...item, quantity: qty } : item);
        setCarrito(updated);
        localStorage.setItem(getCartKey(user), JSON.stringify(updated));
    };

    const getItemPrice = (item) => {
        const extrasTotal = (item.extras || []).reduce((s, e) => s + Number(e.extra_price || 0), 0);
        return Number(item.price) + extrasTotal;
    };
    const getDeliveryFee = () => orderType === 'DELIVERY' ? Number(carrito[0]?.restaurant_delivery_fee || 0) : 0;
    const getTotal = () => carrito.reduce((t, item) => t + getItemPrice(item) * (item.quantity || 1), 0) + getDeliveryFee();

    const handleCheckout = async () => {
        const currentUser = getCurrentUser();
        if (!currentUser) { navigate('/login'); return; }
        if (carrito.length === 0) { alert('Tu carrito esta vacio'); return; }
        if (orderType === 'MESA' && !tableNumber.trim()) { alert('Ingresa el número de mesa'); return; }
        if (orderType === 'DELIVERY' && (!deliveryAddress.trim() || deliveryLat == null || deliveryLng == null)) {
            alert('Marca tu dirección de entrega en el mapa'); return;
        }

        const items = carrito.map(item => ({
            productId: toUUID(item.id),
            productName: item.name,
            quantity: item.quantity || 1,
            unitPrice: getItemPrice(item),
            options: (item.extras || []).map(opt => ({
                optionId: toUUID(opt.id),
                name: opt.name,
                extraPrice: Number(opt.extra_price || opt.extraPrice || 0),
            })),
        }));

        setSubmitting(true);
        try {
            const restaurantId = toUUID(carrito[0].restaurant_id || carrito[0].restaurantId);
            const total = getTotal();

            const order = await createOrder({
                restaurantId,
                clientId: toUUID(currentUser.id),
                type: orderType,
                tableNumber: orderType === 'MESA' ? tableNumber.trim() : null,
                deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress.trim() : null,
                deliveryLat: orderType === 'DELIVERY' ? deliveryLat : null,
                deliveryLng: orderType === 'DELIVERY' ? deliveryLng : null,
                deliveryFee: orderType === 'DELIVERY' ? getDeliveryFee() : null,
                items,
            });

            const payment = await createPayment({
                orderId: order.id,
                restaurantId,
                clientId: toUUID(currentUser.id),
                amount: total,
                method: paymentMethod === 'QR' ? 'QR_ONLINE' : 'CASH',
                items,
            });

            localStorage.removeItem(getCartKey(currentUser));
            setCarrito([]);

            if (paymentMethod === 'QR') {
                setQrOrder({ ...order, paymentId: payment.id });
            } else {
                navigate('/mis-pedidos');
            }
        } catch (err) {
            console.error('Error creating order:', err);
            alert('No se pudo crear el pedido. Intenta nuevamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmQrPayment = async () => {
        setConfirmingQr(true);
        try {
            await simulateQrPayment(qrOrder.paymentId);
            setQrDone(true);
        } catch (err) {
            console.error('Error confirming payment:', err);
            alert('No se pudo confirmar el pago. Intenta nuevamente.');
        } finally {
            setConfirmingQr(false);
        }
    };

    if (loading) {
        return (
            <div className="client-shell d-flex flex-column">
                <Navbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                    <div className="spinner-border me-3" style={{ color: '#e4531f' }} role="status"></div>
                    <span className="fw-semibold client-muted">Cargando tu carrito...</span>
                </div>
            </div>
        );
    }

    if (!user) return null;

    if (qrOrder) {
        return (
            <div className="client-shell d-flex flex-column">
                <Navbar />
                <main className="container flex-grow-1 d-flex align-items-center justify-content-center py-5">
                    <section className="client-hero p-4 p-lg-5 text-center" style={{ maxWidth: 480, width: '100%' }}>
                        {qrDone ? (
                            <>
                                <span className="client-icon-box fs-2 mb-3" style={{ background: '#eaf3ee', color: '#2e7d5b' }}>
                                    <i className="fa-solid fa-check"></i>
                                </span>
                                <h1 className="client-title h2 mb-2">Pago confirmado</h1>
                                <p className="client-muted mb-1">Pedido <strong style={{ color: '#e4531f' }}>{qrOrder.orderCode}</strong></p>
                                <p className="client-muted small mb-4">Tu pedido esta siendo procesado por el restaurante.</p>
                                <div className="d-flex flex-column gap-2">
                                    <button
                                        onClick={() => getReceiptUrl(qrOrder.paymentId)}
                                        className="btn client-button py-3"
                                        style={{ background: '#2e7d5b' }}
                                    >
                                        <i className="fa fa-file-invoice me-2" />
                                        Descargar comprobante
                                    </button>
                                    <button className="btn client-button py-3" onClick={() => navigate('/mis-pedidos')}>
                                        Ver mis pedidos
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="client-kicker mb-2">Pago QR</div>
                                <h1 className="client-title h2 mb-2">Escanea para pagar</h1>
                                <p className="client-muted mb-4 small">Simulacion de pago online para confirmar el pedido.</p>

                                <div className="d-inline-block p-4 rounded-4 mb-4" style={{ background: '#fff', border: '1px solid #ebe1d5' }}>
                                    <QRCodeSVG
                                        value={`RESTOSYS:${qrOrder.orderCode}:${qrOrder.totalAmount}`}
                                        size={200}
                                        bgColor="#ffffff"
                                        fgColor="#211a15"
                                        level="M"
                                    />
                                </div>

                                <div className="p-3 rounded-3 mb-3" style={{ background: '#faf5ee', border: '1px solid #ebe1d5' }}>
                                    <div className="d-flex justify-content-between mb-2 small">
                                        <span className="client-muted">Pedido</span>
                                        <span className="fw-bold" style={{ color: '#e4531f' }}>{qrOrder.orderCode}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small">
                                        <span className="client-muted">Total</span>
                                        <span className="fw-bold">Bs {Number(qrOrder.totalAmount).toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn client-button w-100 py-3 mb-2"
                                    style={{ background: '#2e7d5b' }}
                                    onClick={handleConfirmQrPayment}
                                    disabled={confirmingQr}
                                >
                                    {confirmingQr
                                        ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Confirmando...</>
                                        : 'He realizado el pago'}
                                </button>
                                <button className="btn btn-link client-muted small" onClick={() => navigate('/mis-pedidos')}>
                                    Pagar mas tarde
                                </button>
                            </>
                        )}
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="client-shell d-flex flex-column">
            <Navbar />

            <main className="container py-4 py-lg-5 flex-grow-1">
                <section className="client-hero p-4 p-lg-5 mb-4">
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                        <div>
                            <div className="client-kicker mb-1">Checkout</div>
                            <h1 className="client-title h2 mb-1">Tu carrito</h1>
                            <p className="client-muted mb-0">
                                {carrito.length === 0
                                    ? 'Tu carrito esta vacio'
                                    : `${carrito.length} producto${carrito.length > 1 ? 's' : ''} listo${carrito.length > 1 ? 's' : ''} para confirmar`}
                            </p>
                        </div>
                        <button className="btn client-pill px-4 py-2" onClick={() => navigate(-1)}>
                            <i className="fa-solid fa-arrow-left me-2"></i>
                            Seguir comprando
                        </button>
                    </div>
                </section>

                {carrito.length === 0 ? (
                    <section className="client-empty text-center py-5 px-4">
                        <span className="client-icon-box fs-2 mb-3">
                            <i className="fa-solid fa-cart-arrow-down"></i>
                        </span>
                        <h2 className="client-title h3 mb-2">Tu carrito esta vacio</h2>
                        <p className="client-muted mb-4">Elige un restaurante y agrega productos para continuar.</p>
                        <button onClick={() => navigate('/cliente/dashboard')} className="btn client-button px-5 py-3">
                            Ver restaurantes
                        </button>
                    </section>
                ) : (
                    <div className="row g-4 align-items-start">
                        <div className="col-lg-8">
                            <div className="d-flex flex-column gap-3">
                                {carrito.map(item => (
                                    <article key={item.key || item.id} className="client-card p-3 p-lg-4">
                                        <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center">
                                            <span className="client-icon-box fs-4 flex-shrink-0">
                                                <i className="fa-solid fa-utensils"></i>
                                            </span>
                                            <div className="flex-grow-1">
                                                <h2 className="h5 client-title mb-1">{item.name}</h2>
                                                {item.extras?.length > 0 && (
                                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                                        {item.extras.map(e => (
                                                            <span key={e.id} className="client-pill px-2 py-1 small">
                                                                {e.name} +Bs {Number(e.extra_price).toFixed(2)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="d-flex align-items-center gap-3 justify-content-between justify-content-md-end">
                                                <span className="client-price px-3 py-2">Bs {getItemPrice(item).toFixed(2)}</span>
                                                <div className="d-inline-flex align-items-center gap-2 px-2 py-1" style={{ background: '#faf5ee', border: '1px solid #ebe1d5', borderRadius: 999 }}>
                                                    <button className="btn btn-sm p-0 px-2" onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) - 1)}>-</button>
                                                    <span className="fw-bold small">{item.quantity || 1}</span>
                                                    <button className="btn btn-sm p-0 px-2" onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
                                                </div>
                                                <button className="btn btn-sm px-3" style={{ background: '#e4531f', color: '#fff', border: 'none', borderRadius: 999, fontWeight: 800 }} onClick={() => handleRemoveFromCart(item.id)}>
                                                    Quitar
                                                </button>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-end mt-3 client-muted small">
                                            Subtotal: <strong className="ms-2" style={{ color: '#211a15' }}>Bs {(getItemPrice(item) * (item.quantity || 1)).toFixed(2)}</strong>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <aside className="client-hero p-4 position-sticky" style={{ top: 82 }}>
                                <h2 className="h4 client-title mb-3">Resumen</h2>
                                <div className="d-flex justify-content-between align-items-center py-3 border-top border-bottom" style={{ borderColor: '#ebe1d5' }}>
                                    <span className="client-muted fw-semibold">Total</span>
                                    <span className="h4 mb-0" style={{ color: '#e4531f', fontWeight: 800 }}>Bs {getTotal().toFixed(2)}</span>
                                </div>

                                <div className="mt-4">
                                    <label className="client-kicker mb-2 d-block">Tipo de pedido</label>
                                    <div className="d-flex gap-2">
                                        {[
                                            ['MESA', 'En mesa', 'fa-chair'],
                                            ['PICKUP', 'Para llevar', 'fa-bag-shopping'],
                                            ['DELIVERY', 'Delivery', 'fa-motorcycle'],
                                        ].map(([value, label, icon]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                className={`btn flex-fill client-pill py-3 ${orderType === value ? 'client-pill-active' : ''}`}
                                                onClick={() => setOrderType(value)}
                                            >
                                                <i className={`fa-solid ${icon} d-block mb-1`}></i>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {orderType === 'MESA' && (
                                    <div className="mt-3">
                                        <label className="client-kicker mb-2 d-block">Número de mesa</label>
                                        <input
                                            type="text"
                                            className="form-control py-3"
                                            placeholder="Ej: 5"
                                            style={{ borderColor: '#ebe1d5', borderRadius: 12 }}
                                            value={tableNumber}
                                            onChange={e => setTableNumber(e.target.value)}
                                        />
                                    </div>
                                )}

                                {orderType === 'DELIVERY' && (
                                    <div className="mt-3">
                                        <label className="client-kicker mb-2 d-block">Dirección de entrega</label>
                                        <AddressAutocompleteMap
                                            address={deliveryAddress}
                                            lat={deliveryLat}
                                            lng={deliveryLng}
                                            onChange={(partial) => {
                                                if (partial.address !== undefined) setDeliveryAddress(partial.address);
                                                if (partial.lat !== undefined) setDeliveryLat(partial.lat);
                                                if (partial.lng !== undefined) setDeliveryLng(partial.lng);
                                            }}
                                        />
                                        {getDeliveryFee() > 0 && (
                                            <p className="client-muted small mt-2 mb-0">
                                                Costo de envío: Bs {getDeliveryFee().toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="mt-4">
                                    <label className="client-kicker mb-2 d-block">Metodo de pago</label>
                                    <div className="d-flex gap-2">
                                        {[
                                            ['CAJA', 'En caja', 'fa-cash-register'],
                                            ['QR', 'QR online', 'fa-qrcode'],
                                        ].map(([value, label, icon]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                className={`btn flex-fill client-pill py-3 ${paymentMethod === value ? 'client-pill-active' : ''}`}
                                                onClick={() => setPaymentMethod(value)}
                                            >
                                                <i className={`fa-solid ${icon} d-block mb-1`}></i>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="client-muted small mt-2 mb-0">
                                        {paymentMethod === 'CAJA'
                                            ? 'El restaurante confirmara el pago en caja.'
                                            : 'Se generara un QR simulado para confirmar el pago.'}
                                    </p>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={submitting}
                                    className="btn client-button w-100 py-3 mt-4"
                                    style={{ background: '#e4531f', color: '#fff', border: 'none' }}
                                >
                                    {submitting
                                        ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Procesando...</>
                                        : paymentMethod === 'QR' ? 'Confirmar y pagar con QR' : 'Confirmar pedido'}
                                </button>
                            </aside>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}