import { useEffect, useState } from "react";
import { getPublicProducts, getPublicCategories } from "../../services/menuApi";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardNavbar from "../../components/DashboardNavbar";
import { getCurrentUser } from "../../services/api";

export default function Menu() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const restaurantId = searchParams.get("restaurant_id");
    const user = getCurrentUser();

    useEffect(() => {
        if (restaurantId) {
            loadData(restaurantId);
        } else {
            setLoading(false);
        }
    }, [restaurantId]);

    const loadData = async (id) => {
        try {
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

    const addToCart = (product) => {
        if (!user || user.role !== 'cliente') {
            alert("Debes iniciar sesión como cliente para agregar productos al carrito");
            navigate("/login");
            return;
        }

        const cart = JSON.parse(localStorage.getItem("carrito") || "[]");
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        localStorage.setItem("carrito", JSON.stringify(cart));
        // Opcional: Feedback visual más suave que un alert
    };

    const filteredProducts = selectedCategory 
        ? products.filter(p => p.category_id === selectedCategory)
        : products;

    const cartCount = JSON.parse(localStorage.getItem("carrito") || "[]").reduce((sum, item) => sum + (item.quantity || 1), 0);

    if (loading) {
        return (
            <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <DashboardNavbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                    <div className="spinner-border text-light" role="status"></div>
                </div>
            </div>
        );
    }

    if (!restaurantId) {
        return (
            <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <DashboardNavbar />
                <div className="container flex-grow-1 d-flex align-items-center justify-content-center">
                    <div className="card border-0 shadow-lg p-5 text-center bg-white bg-opacity-10 text-white shadow-lg" style={{ backdropFilter: 'blur(10px)', borderRadius: '20px' }}>
                        <h2 className="fw-bold">Restaurante no especificado</h2>
                        <p className="opacity-75">Escanea el código QR de la mesa para ver el menú.</p>
                        <button className="btn btn-light rounded-pill mt-3 px-4 fw-bold" onClick={() => navigate("/cliente/dashboard")}>Volver</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <DashboardNavbar />
            
            <div className="container py-5">
                <div className="text-center text-white mb-5 animate__animated animate__fadeIn">
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
                        filteredProducts.map(product => (
                            <div key={product.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                                <div className="card h-100 border-0 shadow-lg overflow-hidden animate__animated animate__zoomIn" 
                                     style={{ borderRadius: '20px', transition: 'transform 0.3s ease' }}>
                                    <div className="position-relative">
                                        <img 
                                            src={product.image ? `http://localhost:8001${product.image}` : "https://via.placeholder.com/300x200?text=Sin+Imagen"} 
                                            alt={product.name}
                                            className="card-img-top"
                                            style={{ height: '200px', objectFit: 'cover' }}
                                            onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=Sin+Imagen"; }}
                                        />
                                        <div className="position-absolute top-0 end-0 m-2">
                                            <span className="badge bg-dark bg-opacity-75 rounded-pill px-3 py-2 fs-6">
                                                ${product.price}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-body d-flex flex-column p-4">
                                        <h3 className="h5 fw-bold mb-2 text-dark">{product.name}</h3>
                                        {product.description && (
                                            <p className="card-text text-muted small mb-3 flex-grow-1">
                                                {product.description}
                                            </p>
                                        )}
                                        
                                        {product.options?.length > 0 && (
                                            <div className="mb-3">
                                                <small className="text-primary fw-bold">Extras:</small>
                                                <div className="d-flex flex-wrap gap-1 mt-1">
                                                    {product.options.map(opt => (
                                                        <span key={opt.id} className="badge bg-light text-dark border small fw-normal">
                                                            {opt.name} (+${opt.extra_price})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => addToCart(product)}
                                            className="btn btn-primary w-100 rounded-pill fw-bold"
                                            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
                                        >
                                            + Agregar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Botón flotante del carrito (FAB) */}
            <div className="position-fixed bottom-0 end-0 m-4 shadow-lg animate__animated animate__bounceInUp" style={{ zIndex: 1050 }}>
                <button 
                    className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 position-relative"
                    onClick={() => navigate("/carrito")}
                    style={{ 
                        width: '65px', 
                        height: '65px', 
                        fontSize: '24px',
                        background: '#fff',
                        color: '#764ba2',
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