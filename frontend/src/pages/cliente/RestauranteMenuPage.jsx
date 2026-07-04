import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPublicRestaurantes } from "../../services/api";
import { getPublicProducts, getPublicCategories } from "../../services/menuApi";
import Navbar from "../../components/Navbar";
import { authMediaUrl, menuMediaUrl } from "../../services/mediaUrl";
import "../../styles/client-theme.css";

const CATEGORY_ICON_RULES = [
    { icon: 'fa-burger', keywords: ['hamburguesa', 'burger'] },
    { icon: 'fa-pizza-slice', keywords: ['pizza'] },
    { icon: 'fa-drumstick-bite', keywords: ['pollo', 'chicken', 'carne', 'parrilla', 'grill', 'alita'] },
    { icon: 'fa-fries', keywords: ['papa', 'side', 'acompanamiento', 'acompañamiento'] },
    { icon: 'fa-glass-water', keywords: ['bebida', 'jugo', 'gaseosa', 'agua', 'drink'] },
    { icon: 'fa-mug-saucer', keywords: ['cafe', 'café', 'coffee'] },
    { icon: 'fa-ice-cream', keywords: ['postre', 'helado', 'dulce', 'dessert'] },
    { icon: 'fa-bowl-food', keywords: ['entrada', 'aperitivo', 'sopa', 'starter'] },
    { icon: 'fa-leaf', keywords: ['ensalada', 'salad', 'vegetariano', 'vegano'] },
];
const DEFAULT_CATEGORY_ICON = 'fa-utensils';
const CATEGORY_TINTS = ['#FFEEE4', '#FDEBD3', '#E9F3ED', '#FDE8E8', '#EAF0FB', '#F3EBE0'];
const PRODUCTS_PAGE_SIZE = 12;

function getCategoryIcon(name = '') {
    const lower = name.toLowerCase();
    const rule = CATEGORY_ICON_RULES.find(r => r.keywords.some(k => lower.includes(k)));
    return rule ? rule.icon : DEFAULT_CATEGORY_ICON;
}

function getCategoryTint(categoryId) {
    if (categoryId == null) return CATEGORY_TINTS[0];
    return CATEGORY_TINTS[categoryId % CATEGORY_TINTS.length];
}

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
    const [currentPage, setCurrentPage] = useState(1);

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
        setCartCount(cart.reduce((s, i) => s + (i.quantity || 1), 0));
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    const filteredProducts = selectedCategory
        ? products.filter(p => p.category_id === selectedCategory)
        : products;

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PAGE_SIZE));
    const pageStart = (currentPage - 1) * PRODUCTS_PAGE_SIZE;
    const productsPagina = filteredProducts.slice(pageStart, pageStart + PRODUCTS_PAGE_SIZE);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory]);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);

    if (loading) {
        return (
            <div className="client-shell d-flex align-items-center justify-content-center">
                <div className="spinner-border" style={{ color: '#e4531f' }} role="status"></div>
            </div>
        );
    }

    if (!restaurante) {
        return (
            <div className="client-shell d-flex align-items-center justify-content-center">
                <div className="client-hero p-5 text-center">
                    <h3 className="client-title">Restaurante no encontrado</h3>
                    <Link to="/cliente/dashboard" className="btn client-button mt-3 px-4">Volver</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="client-shell d-flex flex-column" style={{ minHeight: '100vh' }}>
            <Navbar />

            <main className="d-flex flex-column flex-grow-1">
                <header className="client-menu-topbar d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 px-3 px-lg-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                        {restaurante.logo ? (
                            <img
                                src={authMediaUrl(restaurante.logo)}
                                alt={restaurante.name}
                                className="client-logo"
                                style={{ width: 48, height: 48 }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ) : (
                            <span className="client-icon-box" style={{ width: 48, height: 48, fontSize: 20 }}>
                                <i className="fa-solid fa-utensils"></i>
                            </span>
                        )}
                        <div>
                            <h1 className="client-title h5 mb-0">{restaurante.name}</h1>
                            <p className="client-muted mb-0 small">{restaurante.address || "Selecciona tus productos favoritos"}</p>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        <span className="client-live-badge">
                            <span className="client-live-dot"></span>
                            Menu en vivo
                        </span>
                        <button
                            className="btn client-button px-4 py-2 d-inline-flex align-items-center gap-2"
                            style={{ background: '#e4531f', color: '#fff', border: 'none' }}
                            onClick={() => navigate("/carrito")}
                        >
                            <i className="fa-solid fa-cart-shopping"></i>
                            Carrito
                            {cartCount > 0 && <span className="badge bg-light text-dark ms-1">{cartCount}</span>}
                        </button>
                    </div>
                </header>

                <div className="client-menu-panel client-menu-panel-flush d-flex flex-column flex-lg-row flex-grow-1">
                    {categories.length > 0 && (
                        <aside className="client-category-sidebar flex-lg-shrink-0 w-100" style={{ maxWidth: 260 }}>
                            <p className="client-kicker mb-2 px-2">Categorías</p>
                            <div className="client-category-list">
                                <button
                                    type="button"
                                    className={`client-category-item ${!selectedCategory ? 'client-category-item-active' : ''}`}
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    <span className="d-flex align-items-center gap-2">
                                        <i className="fa-solid fa-grip"></i>
                                        <span>Todos</span>
                                    </span>
                                    <span className="client-category-count">{products.length}</span>
                                </button>
                                {categories.map(cat => {
                                    const count = products.filter(p => p.category_id === cat.id).length;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            className={`client-category-item ${selectedCategory === cat.id ? 'client-category-item-active' : ''}`}
                                            onClick={() => setSelectedCategory(cat.id)}
                                        >
                                            <span className="d-flex align-items-center gap-2">
                                                <i className={`fa-solid ${getCategoryIcon(cat.name)}`}></i>
                                                <span>{cat.name}</span>
                                            </span>
                                            <span className="client-category-count">{count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>
                    )}

                    <div className="flex-grow-1 w-100 p-3 p-lg-4 d-flex flex-column">
                        {filteredProducts.length === 0 ? (
                            <div className="client-empty text-center py-5 client-muted">
                                <i className="fa-solid fa-bowl-food fa-2x mb-3 d-block"></i>
                                <p className="h5 mb-0">No hay productos en esta categoria</p>
                            </div>
                        ) : (
                            <div className="row row-cols-1 row-cols-xl-2 g-3">
                                {productsPagina.map(product => {
                                    const extras = selectedExtras[product.id] || [];
                                    const extrasTotal = extras.reduce((s, e) => s + Number(e.extra_price || 0), 0);
                                    const totalPrice = Number(product.price) + extrasTotal;
                                    const justAdded = addedId === product.id;
                                    const category = categories.find(c => c.id === product.category_id);
                                    const icon = getCategoryIcon(category?.name);
                                    const tint = getCategoryTint(product.category_id);

                                    return (
                                        <div key={product.id} className="col">
                                            <article className="client-product-row d-flex gap-3 p-3 h-100">
                                                <div className="client-product-icon flex-shrink-0" style={{ background: tint }}>
                                                    {product.image ? (
                                                        <img src={menuMediaUrl(product.image)} alt={product.name} />
                                                    ) : (
                                                        <i className={`fa-solid ${icon}`}></i>
                                                    )}
                                                </div>
                                                <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
                                                    <div className="d-flex justify-content-between align-items-start gap-2">
                                                        <h2 className="h6 client-title mb-0">{product.name}</h2>
                                                        <span className="fw-bold text-nowrap" style={{ color: '#e4531f' }}>Bs {totalPrice.toFixed(2)}</span>
                                                    </div>
                                                    {product.description && (
                                                        <p className="client-muted small mb-2">{product.description}</p>
                                                    )}

                                                    {product.options?.length > 0 && (
                                                        <div className="d-flex flex-column gap-1 mb-2">
                                                            {product.options.map(opt => (
                                                                <label key={opt.id} className="d-flex align-items-center gap-2 small client-muted">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input mt-0"
                                                                        id={`opt_${product.id}_${opt.id}`}
                                                                        checked={extras.some(e => e.id === opt.id)}
                                                                        onChange={() => handleExtraChange(product.id, opt)}
                                                                    />
                                                                    <span className="flex-grow-1">{opt.name}</span>
                                                                    <span style={{ color: '#c23d12', fontWeight: 700 }}>+Bs {Number(opt.extra_price).toFixed(2)}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <button
                                                        className="btn btn-sm mt-auto align-self-end px-3 fw-bold"
                                                        style={{ background: justAdded ? '#2e7d5b' : '#e4531f', color: '#fff', border: 'none', borderRadius: 10 }}
                                                        onClick={() => addToCart(product)}
                                                    >
                                                        {justAdded ? (
                                                            <><i className="fa-solid fa-check me-1"></i>Agregado</>
                                                        ) : (
                                                            <><i className="fa-solid fa-plus me-1"></i>Agregar</>
                                                        )}
                                                    </button>
                                                </div>
                                            </article>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <nav className="d-flex flex-wrap justify-content-center align-items-center gap-2 mt-auto pt-4">
                                <button
                                    className="btn client-pill px-3 py-2 d-inline-flex align-items-center"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    aria-label="Página anterior"
                                >
                                    <i className="fa-solid fa-chevron-left"></i>
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        className={`btn client-pill px-3 py-2 fw-semibold ${page === currentPage ? 'client-pill-active' : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    className="btn client-pill px-3 py-2 d-inline-flex align-items-center"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    aria-label="Página siguiente"
                                >
                                    <i className="fa-solid fa-chevron-right"></i>
                                </button>
                            </nav>
                        )}
                    </div>
                </div>
            </main>

            <div className="position-fixed bottom-0 end-0 m-4" style={{ zIndex: 1050 }}>
                <button
                    className="btn rounded-circle d-flex align-items-center justify-content-center position-relative client-fab"
                    style={{ background: '#e4531f', color: '#fff', border: 'none' }}
                    onClick={() => navigate("/carrito")}
                    aria-label="Abrir carrito"
                >
                    <i className="fa-solid fa-cart-shopping"></i>
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