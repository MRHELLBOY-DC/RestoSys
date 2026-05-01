import { useEffect, useState } from "react"; /* eslint-disable no-unused-vars, no-undef */
import { getCurrentUser } from "../../services/api";
import { 
    getProducts, 
    createProduct,  // Solo uno
    updateProduct,  // Solo uno
    deleteProduct, 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    getOptions,
    createOption,
    updateOption,
    deleteOption
} from "../../services/menuApi";
import { useNavigate } from "react-router-dom";

export default function RestauranteMenu() {
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const navigate = useNavigate();

    // Estados para formularios
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showProductForm, setShowProductForm] = useState(false);
    const [showOptionForm, setShowOptionForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingOption, setEditingOption] = useState(null);
    const [optionForm, setOptionForm] = useState({
        name: "",
        extra_price: 0,
        product_id: ""
    });

    // Form data
    const [categoryData, setCategoryData] = useState({ name: '' });
    const [productData, setProductData] = useState({ 
    name: '', 
    price: '', 
    description: '', 
    category: '',
    image: null 
});
    const [optionData, setOptionData] = useState({ name: '', extra_price: '', product: '' });

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const currentUser = getCurrentUser();

            if (!token || currentUser?.role !== 'restaurante') {
                navigate("/login");
                return;
            }

            setUser(currentUser);
            loadData();
        };

        checkAuth();
    }, [navigate]);

    const loadData = async () => {
        try {
            const [cats, prods, opts] = await Promise.all([
                getCategories(),
                getProducts(),
                getOptions()
            ]);
            setCategories(cats);
            setProducts(prods);
            setOptions(opts);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Función para cargar opciones de un producto específico
    const loadOptionsForProduct = async (productId) => {
        try {
            const data = await getOptions(productId);
            setOptions(data);
        } catch (error) {
            console.error("Error loading options:", error);
        }
    };


    // ========== CATEGORÍAS ==========
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, categoryData);
            } else {
                await createCategory(categoryData);
            }
            setShowCategoryForm(false);
            setEditingCategory(null);
            setCategoryData({ name: '' });
            loadData();
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryData({ name: category.name });
        setShowCategoryForm(true);
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('¿Eliminar categoría?')) {
            try {
                await deleteCategory(id);
                loadData();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    // ========== PRODUCTOS ==========
// ========== PRODUCTOS ==========
const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    const nameValue = productData.name.trim();
    const priceValue = parseFloat(productData.price);
    const categoryValue = parseInt(productData.category);
    
    if (!nameValue) {
        alert("El nombre del producto es requerido");
        return;
    }
    if (isNaN(priceValue) || priceValue <= 0) {
        alert("El precio debe ser un número mayor a 0");
        return;
    }
    if (isNaN(categoryValue)) {
        alert("Debes seleccionar una categoría");
        return;
    }
    
    try {
        let productToSend;
        const hasImage = productData.image && productData.image instanceof File;
        
        if (hasImage) {
            // Con imagen: usar FormData
            productToSend = new FormData();
            productToSend.append('name', nameValue);
            productToSend.append('price', priceValue);
            productToSend.append('category_id', categoryValue);
            productToSend.append('description', productData.description || '');
            productToSend.append('image', productData.image);
            
            console.log("FormData entries:");
            for (let [key, value] of productToSend.entries()) {
                console.log(`${key}: ${value}`);
            }
        } else {
            // Sin imagen: usar JSON
            productToSend = {
                name: nameValue,
                price: priceValue,
                category_id: categoryValue,
                description: productData.description || "",
            };
            console.log("JSON a enviar:", productToSend);
        }
        
        if (editingProduct) {
            await updateProduct(editingProduct.id, productToSend);
            alert("Producto actualizado");
        } else {
            await createProduct(productToSend);  // ✅ Esta función ya maneja FormData y JSON
            alert("Producto creado");
        }
        
        setShowProductForm(false);
        setEditingProduct(null);
        setProductData({ name: '', price: '', description: '', category: '', image: null });
        loadData();
    } catch (error) {
        console.error('Error saving product:', error);
        alert(error.error || "Error al guardar el producto");
    }
};

    // Cuando se selecciona un producto para editar
    const handleEditProduct = (product) => {
    console.log("Editando producto:", product);  // Para depurar
    
    setEditingProduct(product);
    setSelectedProductId(product.id);
    setShowProductForm(true);  // ✅ IMPORTANTE: Muestra el formulario
    setProductData({
        name: product.name || '',
        price: product.price ? product.price.toString() : '',
        description: product.description || '',
        category: product.category_id ? product.category_id.toString() : '',
        image: null
    });
    loadOptionsForProduct(product.id);
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('¿Eliminar producto?')) {
            try {
                await deleteProduct(id);
                loadData();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleEditOption = (option) => {
        setEditingOption(option);
        setOptionData({ name: option.name, extra_price: option.extra_price, product: option.product });
        setShowOptionForm(true);
    };

    const handleDeleteOption = async (id) => {
        if (window.confirm('¿Eliminar opción?')) {
            try {
                await deleteOption(id);
                loadData();
            } catch (error) {
                console.error('Error deleting option:', error);
            }
        }
    };

    if (loading) return <p>Cargando...</p>;
    if (!user) return <p>No autorizado</p>;

    const handleOptionSubmit = async (e) => {
    e.preventDefault();
    
    if (!optionForm.product_id) {
        alert("Selecciona un producto primero");
        return;
    }
    
    try {
        if (editingOption) {
            await updateOption(editingOption.id, {
                name: optionForm.name,
                extra_price: optionForm.extra_price
            });
            alert("Opción actualizada");
        } else {
            await createOption({
                name: optionForm.name,
                extra_price: optionForm.extra_price,
                product_id: optionForm.product_id
            });
            alert("Opción creada");
        }
        
        setOptionForm({ name: "", extra_price: 0, product_id: "" });
        setEditingOption(null);
        setShowOptionForm(false);
        
        // Recargar opciones del producto actual
        if (selectedProductId) {
            const updatedOptions = await getOptions(selectedProductId);
            setOptions(updatedOptions);
        }
    } catch (error) {
        console.error("Error saving option:", error);
        alert("Error al guardar la opción");
    }
};

    return (
        <div className="menu-management">
            <h1>Gestión de Menú</h1>
            <p>Restaurante: {user.restaurant?.name || 'No asignado'}</p>

            {/* CATEGORÍAS */}
            <section>
                <h2>Categorías</h2>
                <button onClick={() => setShowCategoryForm(true)}>Agregar Categoría</button>
                <ul>
                    {categories.map(cat => (
                        <li key={cat.id}>
                            {cat.name}
                            <button onClick={() => handleEditCategory(cat)}>Editar</button>
                            <button onClick={() => handleDeleteCategory(cat.id)}>Eliminar</button>
                        </li>
                    ))}
                </ul>
            </section>

            {/* PRODUCTOS */}
            <section>
                <h2>Productos</h2>
                <button onClick={() => setShowProductForm(true)}>Agregar Producto</button>
                <ul>
                    {products.map(prod => (
                        <li key={prod.id}>
                            <div>
                                <strong>{prod.name}</strong> - ${prod.price}
                                {prod.image && <img src={`http://localhost:8001${prod.image}`} alt={prod.name} style={{width: '50px', height: '50px'}} />}
                                <p>{prod.description}</p>
                            </div>
                            <button onClick={() => handleEditProduct(prod)}>Editar</button>
                            <button onClick={() => handleDeleteProduct(prod.id)}>Eliminar</button>
                        </li>
                    ))}
                </ul>
            </section>

            {/* OPCIONES */}
            <section>
                <h2>Opciones de Producto</h2>
                <button onClick={() => setShowOptionForm(true)}>Agregar Opción</button>
                <ul>
                    {options.map(opt => (
                        <li key={opt.id}>
                            {opt.name} (+${opt.extra_price})
                            <button onClick={() => handleEditOption(opt)}>Editar</button>
                            <button onClick={() => handleDeleteOption(opt.id)}>Eliminar</button>
                        </li>
                    ))}
                </ul>
            </section>

            {/* FORMULARIOS MODALES */}
            {showCategoryForm && (
                <div className="modal">
                    <form onSubmit={handleCategorySubmit}>
                        <h3>{editingCategory ? 'Editar' : 'Agregar'} Categoría</h3>
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={categoryData.name}
                            onChange={(e) => setCategoryData({...categoryData, name: e.target.value})}
                            required
                        />
                        <button type="submit">Guardar</button>
                        <button type="button" onClick={() => {setShowCategoryForm(false); setEditingCategory(null);}}>Cancelar</button>
                    </form>
                </div>
            )}

            {showProductForm && (
                <div className="modal">
                    <form onSubmit={handleProductSubmit}>
                        <h3>{editingProduct ? 'Editar' : 'Agregar'} Producto</h3>
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={productData.name}
                            onChange={(e) => setProductData({...productData, name: e.target.value})}
                            required
                        />
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Precio"
                            value={productData.price}
                            onChange={(e) => setProductData({...productData, price: e.target.value})}
                            required
                        />
                        <textarea
                            placeholder="Descripción"
                            value={productData.description}
                            onChange={(e) => setProductData({...productData, description: e.target.value})}
                        />
                        <select
                            value={productData.category}
                            onChange={(e) => setProductData({...productData, category: e.target.value})}
                            required
                        >
                            <option value="">Seleccionar Categoría</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProductData({...productData, image: e.target.files[0]})}
                        />
                        <button type="submit">Guardar</button>
                        <button type="button" onClick={() => {setShowProductForm(false); setEditingProduct(null);}}>Cancelar</button>
                    </form>
                </div>
            )}

            {showOptionForm && (
                <div className="modal">
                    <form onSubmit={handleOptionSubmit}>
                        <h3>{editingOption ? 'Editar' : 'Agregar'} Opción</h3>
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={optionData.name}
                            onChange={(e) => setOptionData({...optionData, name: e.target.value})}
                            required
                        />
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Precio extra"
                            value={optionData.extra_price}
                            onChange={(e) => setOptionData({...optionData, extra_price: e.target.value})}
                            required
                        />
                        <select
                            value={optionData.product}
                            onChange={(e) => setOptionData({...optionData, product: e.target.value})}
                            required
                        >
                            <option value="">Seleccionar Producto</option>
                            {products.map(prod => (
                                <option key={prod.id} value={prod.id}>{prod.name}</option>
                            ))}
                        </select>
                        <button type="submit">Guardar</button>
                        <button type="button" onClick={() => {setShowOptionForm(false); setEditingOption(null);}}>Cancelar</button>
                    </form>
                </div>
            )}

            <button onClick={() => navigate("/restaurante/dashboard")}>Volver al Dashboard</button>
        </div>
    );
}