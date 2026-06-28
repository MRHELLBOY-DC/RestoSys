import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "../../components/Navbar";
import { getCurrentUser } from "../../services/api";
import { createOrder } from "../../services/ordersApi";
import { createPayment, simulateQrPayment, getReceiptUrl } from "../../services/paymentsApi";

const toUUID = (id) => `00000000-0000-0000-0000-${String(id).padStart(12, '0')}`;

const inputStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    color: '#fff',
};

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
    const [paymentMethod, setPaymentMethod] = useState('CAJA');
    const [submitting, setSubmitting] = useState(false);

    // QR modal state
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
    const getTotal = () => carrito.reduce((t, item) => t + getItemPrice(item) * (item.quantity || 1), 0);

    const handleCheckout = async () => {
        const currentUser = getCurrentUser();
        if (!currentUser) { navigate('/login'); return; }
        if (carrito.length === 0) { alert('Tu carrito está vacío'); return; }
        if (orderType === 'MESA' && !tableNumber.trim()) { alert('Ingresa el número de mesa'); return; }

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
                items,
            });

            const payment = await createPayment({
                orderId: order.id,
                restaurantId,
                clientId: toUUID(currentUser.id),
                amount: total,
                method: paymentMethod === 'QR' ? 'QR_ONLINE' : 'CASH',
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
            <div className="min-vh-100 d-flex flex-column" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)' }}>
                <Navbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                    <div className="spinner-border text-light me-3" role="status"></div>
                    <span>Cargando tu carrito...</span>
                </div>
            </div>
        );
    }

    if (!user) return null;

    // ── QR Payment Modal ──────────────────────────────────────────────────────
    if (qrOrder) {
        return (
            <div className="min-vh-100 d-flex flex-column" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)' }}>
                <Navbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
                    <div className="text-white text-center" style={{ maxWidth: 420 }}>
                        {qrDone ? (
                            <>
                                <h2 className="fw-bold mb-2">¡Pago confirmado!</h2>
                                <p className="opacity-75 mb-1">Pedido <strong style={{ color: '#f0554d' }}>{qrOrder.orderCode}</strong></p>
                                <p className="opacity-60 small mb-4">Tu pedido está siendo procesado por el restaurante.</p>
                                <div className="d-flex flex-column gap-2">
                                    <button
                                        onClick={() => getReceiptUrl(qrOrder.paymentId)}
                                        className="btn fw-bold text-white px-5 py-2"
                                        style={{ background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)', borderRadius: '12px' }}
                                    >
                                        <i className="fa fa-file-invoice me-2" />
                                        Descargar Comprobante
                                    </button>
                                    <button
                                        className="btn fw-bold text-white px-5 py-2"
                                        style={{ background: 'linear-gradient(135deg, #f0554d 0%, #d73a35 100%)', borderRadius: '12px' }}
                                        onClick={() => navigate('/mis-pedidos')}
                                    >
                                        Ver mis pedidos
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="fw-bold mb-1">Pago QR Simulado</h2>
                                <p className="opacity-75 mb-4 small">Escanea este código con tu app de pagos</p>

                                <div className="d-inline-block p-4 rounded-4 mb-4" style={{ background: '#fff' }}>
                                    <QRCodeSVG
                                        value={`RESTOSYS:${qrOrder.orderCode}:${qrOrder.totalAmount}`}
                                        size={200}
                                        bgColor="#ffffff"
                                        fgColor="#0b090a"
                                        level="M"
                                    />
                                </div>

                                <div className="mb-3 p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    <div className="d-flex justify-content-between mb-1 small">
                                        <span className="opacity-60">Pedido</span>
                                        <span className="fw-bold" style={{ color: '#f0554d' }}>{qrOrder.orderCode}</span>
                                    </div>
                                    <div className="d-flex justify-content-between small">
                                        <span className="opacity-60">Total a pagar</span>
                                        <span className="fw-bold">${Number(qrOrder.totalAmount).toFixed(2)}</span>
                                    </div>
                                </div>

                                <p className="opacity-50 small mb-3">
                                    En un sistema real escanearías el QR con tu banco.<br />
                                    Aquí simulamos la confirmación con el botón de abajo.
                                </p>

                                <button
                                    className="btn w-100 fw-bold text-white py-3 mb-2"
                                    style={{ background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)', borderRadius: '12px' }}
                                    onClick={handleConfirmQrPayment}
                                    disabled={confirmingQr}
                                >
                                    {confirmingQr
                                        ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Confirmando...</>
                                        : '✓ He realizado el pago'}
                                </button>
                                <button
                                    className="btn btn-link text-white opacity-50 small"
                                    onClick={() => navigate('/mis-pedidos')}
                                >
                                    Pagar más tarde (ir a mis pedidos)
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ── Cart view ─────────────────────────────────────────────────────────────
    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)' }}>
            <Navbar />

            <div className="container py-5 flex-grow-1">
                {/* Header mejorado */}
                <div className="text-white mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle p-3" style={{ background: 'rgba(240,85,77,0.15)' }}>
                            <i className="fa fa-cart-shopping fa-2x" style={{ color: '#f0554d' }}></i>
                        </div>
                        <div>
                            <h1 className="fw-bold mb-0">Mi Carrito</h1>
                            <p className="opacity-75 mb-0">
                                {carrito.length === 0 
                                    ? 'Tu carrito está vacío' 
                                    : `${carrito.length} producto${carrito.length > 1 ? 's' : ''} en tu carrito`}
                            </p>
                        </div>
                    </div>
                </div>

                {carrito.length === 0 ? (
                    <div className="text-white text-center p-5" style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '20px' }}>
                        <div className="mb-3" style={{ fontSize: '5rem', color: '#f0554d' }}>
                            <i className="fa fa-cart-arrow-down" aria-hidden="true"></i>
                        </div>
                        <h3 className="fw-bold mb-2">Tu carrito está vacío</h3>
                        <p className="text-white-50 mb-4">¡Parece que aún no has elegido nada delicioso!</p>
                        <button 
                            onClick={() => navigate("/cliente/dashboard")} 
                            className="btn fw-bold rounded-pill px-5 py-2"
                            style={{ background: 'linear-gradient(135deg, #f0554d 0%, #d73a35 100%)', border: 'none', color: '#fff' }}
                        >
                            <i className="fa fa-store me-2"></i>
                            Ver Restaurantes
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {/* Product table */}
                        <div className="col-lg-8">
                            <div className="text-white overflow-hidden shadow-lg" style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '20px' }}>
                                <div className="table-responsive">
                                    <table className="table table-dark table-hover mb-0 align-middle" style={{ background: 'transparent' }}>
                                        <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                                            <tr>
                                                <th className="px-4 py-3 border-0 small text-uppercase opacity-50">Producto</th>
                                                <th className="py-3 border-0 small text-uppercase opacity-50">Precio</th>
                                                <th className="py-3 border-0 small text-uppercase opacity-50 text-center">Cantidad</th>
                                                <th className="py-3 border-0 small text-uppercase opacity-50">Subtotal</th>
                                                <th className="px-4 py-3 border-0"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {carrito.map(item => (
                                                <tr key={item.key || item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                    <td className="px-4 py-3">
                                                        <div className="fw-semibold">{item.name}</div>
                                                        {item.extras?.length > 0 && (
                                                            <div className="mt-1">
                                                                {item.extras.map(e => (
                                                                    <span key={e.id} className="badge me-1 small" style={{ background: 'rgba(240,85,77,0.2)', color: '#f0a09a', border: '1px solid rgba(240,85,77,0.3)' }}>
                                                                        +{e.name} USD/{Number(e.extra_price).toFixed(2)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3">USD/ {getItemPrice(item).toFixed(2)}</td>
                                                    <td className="py-3 text-center">
                                                        <div className="d-inline-flex align-items-center gap-2" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '2px 8px' }}>
                                                            <button className="btn btn-sm btn-link text-white p-0" onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) - 1)}>−</button>
                                                            <span className="small fw-bold">{item.quantity || 1}</span>
                                                            <button className="btn btn-sm btn-link text-white p-0" onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 fw-bold">USD/ {(getItemPrice(item) * (item.quantity || 1)).toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-end">
                                                        <button className="btn btn-sm btn-outline-danger border-0 rounded-circle" onClick={() => handleRemoveFromCart(item.id)}>✕</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Summary panel */}
                        <div className="col-lg-4">
                            <div className="text-white shadow-lg" style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '20px' }}>
                                <div className="p-4">
                                    <h4 className="fw-bold mb-4">Resumen</h4>

                                    <hr style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                                    <div className="d-flex justify-content-between mb-4 mt-2">
                                        <span className="h5 fw-bold">Total</span>
                                        <span className="h5 fw-bold" style={{ color: '#f0554d' }}>USD/ {getTotal().toFixed(2)}</span>
                                    </div>

                                    {/* Order type */}
                                    <div className="mb-3">
                                        <label className="opacity-50 small fw-semibold mb-1 d-block">Tipo de pedido</label>
                                        <select className="form-select fw-semibold" style={inputStyle} value={orderType} onChange={e => setOrderType(e.target.value)}>
                                            <option value="MESA" className="text-dark">En mesa</option>
                                            <option value="PICKUP" className="text-dark">Para llevar</option>
                                        </select>
                                    </div>

                                    {orderType === 'MESA' && (
                                        <div className="mb-3">
                                            <label className="opacity-50 small fw-semibold mb-1 d-block">Número de mesa</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Ej: 5"
                                                style={inputStyle}
                                                value={tableNumber}
                                                onChange={e => setTableNumber(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    {/* Payment method */}
                                    <div className="mb-4">
                                        <label className="opacity-50 small fw-semibold mb-2 d-block">Método de pago</label>
                                        <div className="d-flex gap-2">
                                            <button
                                                type="button"
                                                className="flex-fill py-2 fw-semibold small rounded-3"
                                                style={{
                                                    border: paymentMethod === 'CAJA' ? '2px solid #f0554d' : '1px solid rgba(255,255,255,0.2)',
                                                    background: paymentMethod === 'CAJA' ? 'rgba(240,85,77,0.15)' : 'rgba(255,255,255,0.05)',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => setPaymentMethod('CAJA')}
                                            >
                                                <i className="fa fa-cash-register d-block mb-1" style={{ fontSize: 20 }} />
                                                En caja
                                            </button>
                                            <button
                                                type="button"
                                                className="flex-fill py-2 fw-semibold small rounded-3"
                                                style={{
                                                    border: paymentMethod === 'QR' ? '2px solid #28a745' : '1px solid rgba(255,255,255,0.2)',
                                                    background: paymentMethod === 'QR' ? 'rgba(40,167,69,0.15)' : 'rgba(255,255,255,0.05)',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => setPaymentMethod('QR')}
                                            >
                                                <i className="fa fa-qrcode d-block mb-1" style={{ fontSize: 20 }} />
                                                QR online
                                            </button>
                                        </div>
                                        {paymentMethod === 'CAJA' && (
                                            <p className="opacity-50 small mt-2 mb-0">Paga en caja al retirar tu pedido. El restaurante confirmará el pago.</p>
                                        )}
                                        {paymentMethod === 'QR' && (
                                            <p className="opacity-50 small mt-2 mb-0">Se generará un QR de pago simulado. Confírmalo para que el pedido pase a pagado.</p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={submitting}
                                        className="btn w-100 fw-bold py-3 text-white shadow-sm"
                                        style={{ background: 'linear-gradient(135deg, #f0554d 0%, #d73a35 100%)', border: 'none', borderRadius: '12px' }}
                                    >
                                        {submitting
                                            ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Procesando...</>
                                            : paymentMethod === 'QR' ? '📲 Confirmar y pagar con QR' : 'Confirmar pedido'}
                                    </button>
                                    <button onClick={() => navigate(-1)} className="btn btn-link text-white opacity-50 w-100 mt-2 small">
                                        ← Continuar comprando
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}