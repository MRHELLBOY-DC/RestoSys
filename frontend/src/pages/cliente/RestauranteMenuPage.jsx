import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPublicRestaurantes } from "../../services/api";
import { getPublicProducts, getPublicCategories } from "../../services/menuApi";
import Navbar from "../../components/Navbar";

const bg = 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)';

export default function RestauranteMenuPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [restaurante, setRestaurante] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState({});
    const [cartCount, setCartCount] = useState(0);
    const [addedId, setAddedId] = useState(null);
    const [loading, setLoading] = useState(true);

    const getUser = () => JSON.parse(localStorage.getItem("user") || "null");
    const getCartKey = (u) => u?.id ? `carrito_${u.id}` : "carrito_guest";

    useEffect(() => {
        loadData();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadData = async () => {
        setLoading(true);
        try {
            const restaurantes = await getPublicRestaurantes();
            const rest = restaurantes.find(r => r.id === parseInt(id));
            setRestaurante(rest);
            const [productsData, categoriesData] = await Promise.all([
                getPublicProducts(id),
                getPublicCategories(id)
            ]);
            setProducts(productsData);
            setCategories(categoriesData);

            const user = getUser();
            const cart = JSON.parse(localStorage.getItem(getCartKey(user)) || "[]");
            setCartCount(cart.reduce((s, i) => s + (i.quantity || 1), 0));
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExtraChange = (productId, option) => {
        setSelectedExtras(prev => {
            const current = prev[productId] || [];
            const exists = current.find(o => o.id === option.id);
            return {
                ...prev,
                [productId]: exists
                    ? current.filter(o => o.id !== option.id)
                    : [...current, option]
            };
        });
    };

    const addToCart = (product) => {
        const user = getUser();
        if (!user || user.role !== 'cliente') {
            navigate("/login");
            return;
        }
        const extras = selectedExtras[product.id] || [];
        const extrasTotal = extras.reduce((s, e) => s + Number(e.extra_price || 0), 0);
        const optionsKey = extras.map(o => o.id).sort().join(',');
        const itemKey = `${product.id}_${optionsKey}`;
        const cartKey = getCartKey(user);
        const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");

        const existing = cart.findIndex(i => i.key === itemKey);
        if (existing !== -1) {
            cart[existing].quantity += 1;
        } else {
            cart.push({
                key: itemKey,
                id: product.id,
                name: product.name,
                price: Number(product.price),
                extras,
                totalPrice: Number(product.price) + extrasTotal,
                quantity: 1,
                restaurant_id: parseInt(id),
                restaurant_name: restaurante?.name
            });
        }

        localStorage.setItem(cartKey, JSON.stringify(cart));
        const newCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);
        setCartCount(newCount);
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    const filteredProducts = selectedCategory
        ? products.filter(p => p.category_id === selectedCategory)
        : products;

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: bg }}>
                <div className="spinner-border text-light" role="status"></div>
            </div>
        );
    }

    if (!restaurante) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: bg }}>
                <div className="text-center text-white">
                    <h3>Restaurante no encontrado</h3>
                    <Link to="/" className="btn btn-outline-light mt-3">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100" style={{ background: bg }}>
            <Navbar />

            <div className="container py-4">
                {/* Header del restaurante */}
                <div className="card border-0 shadow-lg mb-4 text-white" style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                    <div className="card-body p-4 d-flex align-items-center gap-4">
                        {restaurante.logo ? (
                            <img
                                src={`http://localhost:8000${restaurante.logo}`}
                                alt={restaurante.name}
                                style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)' }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        ) : (
                            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(240,85,77,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                                🍽️
                            </div>
                        )}
                        <div>
                            <h1 className="fw-bold mb-1 h3">{restaurante.name}</h1>
                            {restaurante.address && <p className="opacity-60 mb-0 small">{restaurante.address}</p>}
                        </div>
                    </div>
                </div>

                {/* Filtro categorías */}
                {categories.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mb-4">
                        <button
                            className={`btn rounded-pill px-4 fw-bold ${!selectedCategory ? 'btn-light' : 'btn-outline-light'}`}
                            onClick={() => setSelectedCategory(null)}
                        >Todos</button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`btn rounded-pill px-4 fw-bold ${selectedCategory === cat.id ? 'btn-light' : 'btn-outline-light'}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >{cat.name}</button>
                        ))}
                    </div>
                )}

                {/* Grid productos */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center text-white py-5 opacity-60">
                        <p className="h5">No hay productos en esta categoría</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredProducts.map(product => {
                            const extras = selectedExtras[product.id] || [];
                            const extrasTotal = extras.reduce((s, e) => s + Number(e.extra_price || 0), 0);
                            const totalPrice = Number(product.price) + extrasTotal;
                            const justAdded = addedId === product.id;

                            return (
                                <div key={product.id} className="col-12 col-md-6 col-lg-4">
                                    <div className="card h-100 border-0 shadow-lg overflow-hidden" style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.95)' }}>
                                        {product.image ? (
                                            <img
                                                src={`http://localhost:8001${product.image}`}
                                                alt={product.name}
                                                className="card-img-top"
                                                style={{ height: '180px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ height: '180px', background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                                                🍽️
                                            </div>
                                        )}
                                        <div className="card-body d-flex flex-column p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h5 className="fw-bold mb-0">{product.name}</h5>
                                                <span className="badge px-3 py-2 fs-6" style={{ background: 'linear-gradient(135deg, #f0554d, #d73a35)', color: '#fff' }}>
                                                    USD/ {totalPrice.toFixed(2)}
                                                </span>
                                            </div>
                                            {product.description && (
                                                <p className="text-muted small mb-3 flex-grow-1">{product.description}</p>
                                            )}

                                            {product.options?.length > 0 && (
                                                <div className="mb-3">
                                                    <small className="fw-bold text-muted">Extras:</small>
                                                    <div className="mt-1">
                                                        {product.options.map(opt => (
                                                            <div key={opt.id} className="form-check mb-1">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id={`opt_${product.id}_${opt.id}`}
                                                                    checked={extras.some(e => e.id === opt.id)}
                                                                    onChange={() => handleExtraChange(product.id, opt)}
                                                                />
                                                                <label className="form-check-label small" htmlFor={`opt_${product.id}_${opt.id}`}>
                                                                    {opt.name} <span className="text-primary">+USD/ {Number(opt.extra_price).toFixed(2)}</span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <button
                                                className="btn w-100 fw-bold rounded-pill mt-auto"
                                                style={{
                                                    background: justAdded ? '#28a745' : 'linear-gradient(135deg, #f0554d, #d73a35)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    transition: 'background 0.3s'
                                                }}
                                                onClick={() => addToCart(product)}
                                            >
                                                {justAdded ? '✓ Agregado' : '+ Agregar al carrito'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* FAB carrito */}
            <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1050 }}>
                <button
                    className="btn rounded-circle d-flex align-items-center justify-content-center position-relative"
                    onClick={() => navigate("/carrito")}
                    style={{ width: 65, height: 65, background: '#fff', color: '#f0554d', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', fontSize: 24 }}
                >
                    🛒
                    {cartCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
