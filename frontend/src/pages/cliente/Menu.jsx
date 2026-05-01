import { useEffect, useState } from "react";
import { getPublicProducts, getPublicCategories } from "../../services/menuApi";

export default function Menu() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        // Obtener ID del restaurante desde la URL o parámetro
        const urlParams = new URLSearchParams(window.location.search);
        const restaurantId = urlParams.get('restaurant_id') || 1; // Temporal
        
        Promise.all([
            getPublicProducts(restaurantId),
            getPublicCategories(restaurantId)
        ]).then(([productsData, categoriesData]) => {
            setProducts(productsData);
            setCategories(categoriesData);
        });
    }, []);

    const filteredProducts = selectedCategory 
        ? products.filter(p => p.category === selectedCategory)
        : products;

    return (
        <div className="menu">
            <h2>Menú Digital</h2>
            
            <div className="categories">
                <button onClick={() => setSelectedCategory(null)}>Todos</button>
                {categories.map(c => (
                    <button key={c.id} onClick={() => setSelectedCategory(c.id)}>
                        {c.name}
                    </button>
                ))}
            </div>

            <div className="products">
                {filteredProducts.map(p => (
                    <div key={p.id} className="card">
                        {p.image && <img src={`http://localhost:8001${p.image}`} alt={p.name} />}
                        <h3>{p.name}</h3>
                        <p>Precio: ${p.price}</p>
                        {p.description && <p>{p.description}</p>}
                        {p.options?.length > 0 && (
                            <div className="options">
                                <small>Extras:</small>
                                {p.options.map(opt => (
                                    <div key={opt.id}>+ {opt.name} (${opt.extra_price})</div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}