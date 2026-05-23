import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPublicRestaurantes } from "../../services/api";
import { getPublicProducts, getPublicCategories } from "../../services/menuApi";
import DashboardNavbar from "../../components/DashboardNavbar";

export default function RestauranteMenuPage() {
    const { id } = useParams();
    const [restaurante, setRestaurante] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Cargar restaurante
            const restaurantes = await getPublicRestaurantes();
            const rest = restaurantes.find(r => r.id === parseInt(id));
            setRestaurante(rest);
            
            // Cargar productos y categorías del restaurante
            const [productsData, categoriesData] = await Promise.all([
                getPublicProducts(id),
                getPublicCategories(id)
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user || user.role !== 'cliente') {
            alert("Inicia sesión como cliente para agregar al carrito");
            navigate("/login");
            return;
        }
        const cartKey = user?.id ? `carrito_${user.id}` : "carrito_guest";
        const cart = JSON.parse(localStorage.getItem(cartKey) || "[]");
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({ 
                ...product, 
                quantity: 1, 
                restaurant_id: parseInt(id), 
                restaurant_name: restaurante?.name 
            });
        }
        
        localStorage.setItem(cartKey, JSON.stringify(cart));
        alert(`${product.name} agregado al carrito`);
    };

    const filteredProducts = selectedCategory 
        ? products.filter(p => p.category_id === selectedCategory)
        : products;

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" 
                 style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)' }}>
                <div className="spinner-border text-light" role="status"></div>
            </div>
        );
    }

    if (!restaurante) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center" 
                 style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)' }}>
                <div className="text-center text-white">
                    <h3>Restaurante no encontrado</h3>
                    <Link to="/" className="btn btn-outline-light mt-3">Volver al inicio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)' }}>
            <DashboardNavbar />
            
            <div className="container py-4">
                {/* Botón volver */}
                <div className="mb-4">
                    <Link to="/" className="text-white text-decoration-none">
                        ← Volver al inicio
                    </Link>
                </div>
                
                {/* Header del restaurante */}
                <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                    <div className="text-center p-5" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(240,85,77,0.3) 0%, transparent 50%), linear-gradient(160deg, #0b090a 0%, #1b0a0a 50%, #0a0606 100%)' }}>
                        {/* LOGO DEL RESTAURANTE */}
                        {restaurante.logo ? (
                            <img 
                                src={`http://localhost:8000${restaurante.logo}`} 
                                alt={`Logo de ${restaurante.name}`}
                                style={{ 
                                    width: '120px', 
                                    height: '120px', 
                                    objectFit: 'cover',
                                    borderRadius: '50%',
                                    border: '3px solid white',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<span style="font-size: 4rem">🍽️</span>';
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: '4rem' }}></span>
                        )}
                    </div>
                    <div className="card-body p-4">
                        <h1 className="card-title mb-2">{restaurante.name}</h1>
                        <p className="text-muted">{restaurante.address || "Ubicación no especificada"}</p>
                    </div>
                </div>
                
                {/* Categorías */}
                {categories.length > 0 && (
                    <div className="d-flex flex-wrap gap-2 mb-4">
                        <button 
                            className={`btn rounded-pill px-4 ${!selectedCategory ? 'btn-light' : 'btn-outline-light'}`}
                            onClick={() => setSelectedCategory(null)}
                        >
                            Todos
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`btn rounded-pill px-4 ${selectedCategory === cat.id ? 'btn-light' : 'btn-outline-light'}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}
                
                {/* Productos */}
                {filteredProducts.length === 0 ? (
                    <div className="text-center text-white py-5">
                        <p>No hay productos disponibles</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="col-12 col-md-6 col-lg-4">
                                <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                    {product.image && (
                                        <img 
                                            src={`http://localhost:8001${product.image}`} 
                                            alt={product.name}
                                            className="card-img-top"
                                            style={{ height: '160px', objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
                                        />
                                    )}
                                    <div className="card-body">
                                        <h5 className="card-title">{product.name}</h5>
                                        {product.description && (
                                            <p className="card-text text-muted small">{product.description}</p>
                                        )}
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span className="h5 text-primary mb-0">${product.price}</span>
                                            <button 
                                                className="btn btn-primary rounded-pill"
                                                onClick={() => addToCart(product)}
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}