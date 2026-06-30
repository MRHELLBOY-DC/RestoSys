import { useState, useEffect } from "react";
import { getPublicProducts, getPublicCategories } from "../../services/menuApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../hooks/useAuth";
import { menuMediaUrl } from "../../services/mediaUrl";

export default function Menu() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedExtras, setSelectedExtras] = useState({});
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const restaurantId = searchParams.get("restaurant_id");
    const { user } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const cartKey = user?.id ? `carrito_${user.id}` : "carrito_guest";

    useEffect(() => {
        if (restaurantId) {
            loadData(restaurantId);
        } else {
            setLoading(false);
        }
        
        const initialCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
        const count = initialCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(count);
    }, [restaurantId, cartKey]);

    const loadData = async (id) => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                getPublicProducts(id),
                getPublicCategories(id)
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error("Error loading menu:", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product, selectedOptions = []) => {
        if (!user || user.role !== 'cliente') {
            alert("Debes iniciar sesión como cliente para agregar productos al carrito");
            navigate("/login");
            return;
        }

        const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
        
        // Crear un identificador único que incluya las opciones seleccionadas
        const optionsKey = selectedOptions.map(opt => opt.id).sort().join(',');
        const itemKey = `${product.id}_${optionsKey}`;
        
        const existingItemIndex = cart.findIndex(item => item.key === itemKey);
        
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            // Calcular precio total con extras
            const extrasTotal = selectedOptions.reduce((sum, opt) => sum + opt.extra_price, 0);
            cart.push({ 
                key: itemKey,
                id: product.id,
                name: product.name,
                price: product.price,
                extras: selectedOptions,
                totalPrice: product.price + extrasTotal,
                quantity: 1
            });
        }
        
        localStorage.setItem(cartKey, JSON.stringify(cart));
        
        const newCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(newCount);
        
        alert(`${product.name} agregado al carrito`);
    };

    const handleExtraChange = (productId, option) => {
        setSelectedExtras(prev => {
            const current = prev[productId] || [];
            const exists = current.find(opt => opt.id === option.id);
            
            if (exists) {
                return { ...prev, [productId]: current.filter(opt => opt.id !== option.id) };
            } else {
                return { ...prev, [productId]: [...current, option] };
            }
        });
    };

    const filteredProducts = selectedCategory 
        ? products.filter(p => p.category_id === selectedCategory)
        : products;

    if (loading) {
        return (
            <div className="min-vh-100 d-flex flex-column" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)' }}>
                <Navbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                    <div className="spinner-border text-light" role="status"></div>
                </div>
            </div>
        );
    }

    if (!restaurantId) {
        return (
            <div className="min-vh-100 d-flex flex-column" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)' }}>
                <Navbar />
                <div className="container flex-grow-1 d-flex align-items-center justify-content-center">
                    <div className="card border-0 shadow-lg p-5 text-center bg-white bg-opacity-10 text-white" style={{ backdropFilter: 'blur(10px)', borderRadius: '20px' }}>
                        <h2 className="fw-bold">Restaurante no especificado</h2>
                        <p className="opacity-75">Escanea el código QR de la mesa para ver el menú.</p>
                        <button className="btn btn-light rounded-pill mt-3 px-4 fw-bold" onClick={() => navigate("/cliente/dashboard")}>Volver</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)' }}>
            <Navbar />
            
            <div className="container py-5">
                <div className="text-center text-white mb-5">
                    <h1 className="display-5 fw-bold">Menú Digital</h1>
                    <p className="lead opacity-75">Selecciona tus platillos favoritos</p>
                </div>

                {/* Filtro de Categorías */}
                <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
                    <button 
                        className={`btn rounded-pill px-4 fw-bold shadow-sm ${!selectedCategory ? 'btn-light' : 'btn-outline-light'}`}
                        onClick={() => setSelectedCategory(null)}
                    >Todos</button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`btn rounded-pill px-4 fw-bold shadow-sm ${selectedCategory === cat.id ? 'btn-light' : 'btn-outline-light'}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >{cat.name}</button>
                    ))}
                </div>

                {/* Grid de Productos */}
                <div className="row g-4">
                    {filteredProducts.length === 0 ? (
                        <div className="col-12 text-center text-white opacity-50 py-5">
                            <p className="h4">No hay productos en esta categoría</p>
                        </div>
                    ) : (
                        filteredProducts.map(product => {
                            const productExtras = selectedExtras[product.id] || [];
                            const totalPrice = product.price + productExtras.reduce((sum, opt) => sum + opt.extra_price, 0);
                            
                            return (
                                <div key={product.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                                    <div className="card h-100 border-0 shadow-lg overflow-hidden" style={{ borderRadius: '20px', transition: 'transform 0.3s ease' }}>
                                        <div className="position-relative">
                                            <img 
                                                src={product.image ? menuMediaUrl(product.image) : "https://via.placeholder.com/300x200?text=Sin+Imagen"} 
                                                alt={product.name}
                                                className="card-img-top"
                                                style={{ height: '200px', objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=Sin+Imagen"; }}
                                            />
                                            <div className="position-absolute top-0 end-0 m-2">
                                                <span className="badge bg-dark bg-opacity-75 rounded-pill px-3 py-2 fs-6">
                                                    ${totalPrice.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="card-body d-flex flex-column p-4">
                                            <h3 className="h5 fw-bold mb-2">{product.name}</h3>
                                            {product.description && (
                                                <p className="card-text text-muted small mb-3 flex-grow-1">
                                                    {product.description}
                                                </p>
                                            )}
                                            
                                            {/* Opciones/Extras del producto */}
                                            {product.options && product.options.length > 0 && (
                                                <div className="mb-3">
                                                    <small className="text-muted fw-bold">✨ Extras:</small>
                                                    <div className="mt-2">
                                                        {product.options.map(opt => (
                                                            <div key={opt.id} className="form-check mb-1">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id={`opt_${product.id}_${opt.id}`}
                                                                    checked={productExtras.some(e => e.id === opt.id)}
                                                                    onChange={() => handleExtraChange(product.id, opt)}
                                                                />
                                                                <label className="form-check-label small" htmlFor={`opt_${product.id}_${opt.id}`}>
                                                                    {opt.name} <span className="text-primary">(+${opt.extra_price})</span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <button 
                                                onClick={() => addToCart(product, productExtras)}
                                                className="btn btn-primary w-100 rounded-pill fw-bold mt-2"
                                                style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)', border: 'none' }}
                                            >
                                                + Agregar al Carrito
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* FAB del carrito */}
            <div className="position-fixed bottom-0 end-0 m-4 shadow-lg" style={{ zIndex: 1050 }}>
                <button 
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 position-relative"
                    onClick={() => navigate("/carrito")}
                    style={{ 
                        width: '65px', 
                        height: '65px', 
                        fontSize: '24px',
                        background: '#fff',
                        color: '#f0554d',
                        border: 'none'
                    }}
                >
                    
                    {cartCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}