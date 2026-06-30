/* eslint-disable no-unused-vars, no-undef */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { 
    getProducts, 
    createProduct,
    updateProduct,
    deleteProduct, 
    getCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    getOptions,
} from "../../../services/menuApi";
import AdminShell from "../../../components/AdminShell";
import { CategoryModal } from "../../../components/modals/restaurantModals/CategoryModal";
import { ProductModal } from "../../../components/modals/restaurantModals/ProductModal";
import { ExtrasModal } from "../../../components/modals/restaurantModals/ExtrasModal";
import { menuMediaUrl } from "../../../services/mediaUrl";

const getFoodIcon = (name = '', category = '') => {
    const t = `${name} ${category}`.toLowerCase();
    if (/bebida|gaseosa|jugo|refresco|agua|licuado|smoothie|cerveza|vino|coctel/.test(t)) return 'fa-wine-glass';
    if (/café|cafe|capuchino|latte|espresso/.test(t)) return 'fa-mug-hot';
    if (/postre|torta|pastel|cake|helado|brownie|cheesecake|cookie|galleta|muffin/.test(t)) return 'fa-cake-candles';
    if (/pizza/.test(t)) return 'fa-pizza-slice';
    if (/hamburguesa|burger|sandwich|sándwich/.test(t)) return 'fa-burger';
    if (/pasta|spaghetti|fideo|tallarín/.test(t)) return 'fa-bowl-food';
    if (/ensalada|salad/.test(t)) return 'fa-leaf';
    if (/pollo|chicken|alita|nugget/.test(t)) return 'fa-drumstick-bite';
    if (/carne|res|lomo|steak|bife|churrasco|cerdo/.test(t)) return 'fa-cow';
    if (/marisco|camarón|ceviche|pescado|atún|salmon|salmón/.test(t)) return 'fa-fish';
    if (/sopa|caldo|crema/.test(t)) return 'fa-bowl-food';
    if (/taco|burrito|quesadilla/.test(t)) return 'fa-pepper-hot';
    if (/papas|fries|patata/.test(t)) return 'fa-fire';
    if (/helado|ice cream/.test(t)) return 'fa-ice-cream';
    return 'fa-utensils';
};

export default function AdminRestauranteMenu() {
    const { user, loading } = useAuth(['restaurante']);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [options, setOptions] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Auto-ocultar mensajes después de 4 segundos
    useEffect(() => {
        if (errorMessage || successMessage) {
            const timer = setTimeout(() => {
                setErrorMessage('');
                setSuccessMessage('');
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [errorMessage, successMessage]);

    // Estados para formularios
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showProductForm, setShowProductForm] = useState(false);
    const [showExtrasForm, setShowExtrasForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form data
    const [categoryData, setCategoryData] = useState({ name: '' });
    const [productData, setProductData] = useState({ 
        name: '', 
        price: '', 
        description: '', 
        category: '',
        image: null 
    });

    // Degradado personalizado
    const adminGradient = 'linear-gradient(135deg, #c0392b 0%, #7b1d1d 100%)';

    // Control de modales
    const openCategoryForm = () => {
        setEditingCategory(null);
        setCategoryData({ name: '' });
        setShowCategoryForm(true);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const closeCategoryForm = () => {
        setShowCategoryForm(false);
        setEditingCategory(null);
        setCategoryData({ name: '' });
        setErrorMessage('');
        setSuccessMessage('');
    };

    const openProductForm = () => {
        setEditingProduct(null);
        setProductData({ name: '', price: '', description: '', category: '', image: null });
        setShowProductForm(true);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const closeProductForm = () => {
        setShowProductForm(false);
        setEditingProduct(null);
        setProductData({ name: '', price: '', description: '', category: '', image: null });
        setErrorMessage('');
        setSuccessMessage('');
    };

    const openExtrasForm = (product) => {
        setSelectedProduct(product);
        setShowExtrasForm(true);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const closeExtrasForm = () => {
        setShowExtrasForm(false);
        setSelectedProduct(null);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const loadData = async () => {
        try {
            const [cats, prods] = await Promise.all([
                getCategories(),
                getProducts()
            ]);
            setCategories(cats);
            setProducts(prods);
            
            let todasLasOpciones = [];
            for (const prod of prods) {
                try {
                    const opts = await getOptions(prod.id);
                    todasLasOpciones = [...todasLasOpciones, ...opts];
                } catch (err) {
                    console.error(`Error cargando opciones para producto ${prod.id}:`, err);
                }
            }
            setOptions(todasLasOpciones);
        } catch (error) {
            console.error('Error loading data:', error);
            setErrorMessage(error.response?.data?.error || 'Error al cargar los datos');
        } finally {
            setLoadingData(false);
        }
    };

    const refreshOptionsForProduct = async (productId) => {
        try {
            const nuevasOpciones = await getOptions(productId);
            setOptions(prevOptions => {
                const otrasOpciones = prevOptions.filter(opt => opt.product_id !== productId);
                return [...otrasOpciones, ...nuevasOpciones];
            });
        } catch (err) {
            console.error(`Error refreshing options for product ${productId}:`, err);
            setErrorMessage(err.response?.data?.error || 'Error al cargar las opciones');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ========== CATEGORÍAS ==========
    const handleCategorySubmit = async (data) => {
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, data);
                setSuccessMessage('Categoría actualizada correctamente');
            } else {
                await createCategory(data);
                setSuccessMessage('Categoría creada correctamente');
            }
            await loadData();
            closeCategoryForm();
        } catch (error) {
            console.error('Error saving category:', error);
            setErrorMessage(error.response?.data?.error || 'Error al guardar la categoría');
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryData({ name: category.name });
        setShowCategoryForm(true);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('¿Eliminar categoría?')) {
            try {
                await deleteCategory(id);
                setSuccessMessage('Categoría eliminada correctamente');
                await loadData();
            } catch (error) {
                console.error('Error deleting category:', error);
                setErrorMessage(error.response?.data?.error || 'Error: no puedes eliminar una categoria que tiene productos asociados.');
            }
        }
    };

    // ========== PRODUCTOS ==========
    const handleProductSubmit = async (data) => {
        const nameValue = data.name.trim();
        const priceValue = parseFloat(data.price);
        const categoryValue = parseInt(data.category);
        
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
            const hasImage = data.image && data.image instanceof File;
            
            if (hasImage) {
                productToSend = new FormData();
                productToSend.append('name', nameValue);
                productToSend.append('price', priceValue);
                productToSend.append('category_id', categoryValue);
                productToSend.append('description', data.description || '');
                productToSend.append('image', data.image);
            } else {
                productToSend = {
                    name: nameValue,
                    price: priceValue,
                    category_id: categoryValue,
                    description: data.description || "",
                };
            }
            
            if (editingProduct) {
                await updateProduct(editingProduct.id, productToSend);
                setSuccessMessage('Producto actualizado correctamente');
            } else {
                await createProduct(productToSend);
                setSuccessMessage('Producto creado correctamente');
            }
            
            await loadData();
            closeProductForm();
        } catch (error) {
            console.error('Error saving product:', error);
            setErrorMessage(error.response?.data?.error || 'Error al guardar el producto');
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductData({
            name: product.name || '',
            price: product.price ? product.price.toString() : '',
            description: product.description || '',
            category: product.category_id ? product.category_id.toString() : '',
            image: null
        });
        setShowProductForm(true);
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('¿Eliminar producto?')) {
            try {
                await deleteProduct(id);
                setSuccessMessage('Producto eliminado correctamente');
                await loadData();
            } catch (error) {
                console.error('Error deleting product:', error);
                const errorMsg = error.response?.data?.error || 'Error: no puedes eliminar un producto que tiene opciones asociadas.';
                setErrorMessage(errorMsg);
                // El mensaje se mostrará en la UI automáticamente
            }
        }
    };

    const getOptionsForProduct = (productId) => {
        return options.filter(opt => opt.product_id === productId);
    };

    if (loading || loadingData) {
        return (
            <AdminShell title="Gestion de menu" subtitle="Cargando gestion de menu...">
                <div className="d-flex align-items-center justify-content-center text-white" style={{ minHeight: "60vh" }}>
                    <div className="spinner-border text-light me-2" role="status"></div>
                    <p className="mb-0 fw-bold">Cargando gestion de menu...</p>
                </div>
            </AdminShell>
        );
    }

    if (!user) return null;

    const categoriesMap = categories.reduce((map, cat) => {
        map.set(cat.id, cat.name);
        return map;
    }, new Map());

    return (
        <AdminShell
            title="Gestion de menu"
            subtitle={`${products.length} productos · ${categories.length} categorias`}
            actions={
                <div className="resto-actions">
                    <button className="resto-btn-ghost" type="button" onClick={openCategoryForm}>
                        Nueva categoria
                    </button>
                    <button className="resto-btn-primary" type="button" onClick={openProductForm}>
                        + Nuevo producto
                    </button>
                </div>
            }
        >
            {/* Mostrar mensajes de éxito/error con auto-ocultamiento */}
            {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert" style={{ borderRadius: '12px', marginBottom: '16px' }}>
                    {successMessage}
                    <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                </div>
            )}
            {errorMessage && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert" style={{ borderRadius: '12px', marginBottom: '16px' }}>
                    {errorMessage}
                    <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
                </div>
            )}

            <div className="resto-table">
                <div className="resto-table-header">
                    <span></span>
                    <span>Producto</span>
                    <span>Categoría</span>
                    <span>Precio</span>
                    <span></span>
                </div>
                {products.length === 0 ? (
                    <div className="resto-empty">No hay productos cargados.</div>
                ) : (
                    products.map((prod) => (
                        <div key={prod.id} className="resto-row">
                            <div className="resto-thumb">
                                {prod.image ? (
                                    <img src={menuMediaUrl(prod.image)} alt={prod.name} />
                                ) : (
                                    <div className="resto-thumb-fallback">
                                        <i className={`fa ${getFoodIcon(prod.name, categoriesMap.get(prod.category_id))}`} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="resto-name">{prod.name}</div>
                                <div className="resto-muted">{prod.description || "Sin descripción"}</div>
                            </div>
                            <div className="resto-muted">{categoriesMap.get(prod.category_id) || "-"}</div>
                            <div className="resto-price">USD/ {Number(prod.price).toFixed(2)}</div>
                            <div className="resto-row-actions">
                                <button className="resto-icon-btn" type="button" onClick={() => handleEditProduct(prod)}>Editar</button>
                                <button className="resto-icon-btn" type="button" onClick={() => openExtrasForm(prod)}>Extras</button>
                                <button className="resto-icon-btn danger" type="button" onClick={() => handleDeleteProduct(prod.id)}>Eliminar</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="resto-categories">
                <div className="resto-section-title">Categorias</div>
                {categories.length === 0 ? (
                    <div className="resto-empty">No hay categorias. Crea la primera.</div>
                ) : (
                    <div className="resto-cat-grid">
                        {categories.map((cat) => (
                            <div key={cat.id} className="resto-cat-card">
                                <span>{cat.name}</span>
                                <div className="resto-row-actions">
                                    <button className="resto-icon-btn" type="button" onClick={() => handleEditCategory(cat)}>Editar</button>
                                    <button className="resto-icon-btn danger" type="button" onClick={() => handleDeleteCategory(cat.id)}>Eliminar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .resto-actions {
                    display: flex;
                    gap: 10px;
                }
                .resto-btn-primary {
                    background: #d44a42;
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    padding: 8px 14px;
                    font-weight: 700;
                }
                .resto-btn-ghost {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 12px;
                    padding: 8px 14px;
                    font-weight: 600;
                }
                .resto-table {
                    display: grid;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 16px;
                }
                .resto-table-header,
                .resto-row {
                    display: grid;
                    grid-template-columns: 60px 1.5fr 1fr 0.7fr 0.8fr;
                    align-items: center;
                    gap: 12px;
                }
                .resto-table-header {
                    color: rgba(255, 255, 255, 0.55);
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                .resto-row {
                    padding: 10px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }
                .resto-row:last-child {
                    border-bottom: none;
                }
                .resto-thumb {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    overflow: hidden;
                    flex-shrink: 0;
                    background: rgba(255, 255, 255, 0.08);
                }
                .resto-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .resto-thumb-fallback {
                    width: 100%;
                    height: 100%;
                    background: rgba(212, 74, 66, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #d44a42;
                    font-size: 1.1rem;
                }
                .resto-name {
                    font-weight: 600;
                }
                .resto-muted {
                    color: rgba(255, 255, 255, 0.55);
                    font-size: 0.8rem;
                }
                .resto-price {
                    font-weight: 700;
                    color: #d44a42;
                }
                .resto-row-actions {
                    display: flex;
                    gap: 8px;
                    justify-content: flex-end;
                }
                .resto-icon-btn {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    padding: 6px 10px;
                    font-size: 0.75rem;
                }
                .resto-icon-btn.danger {
                    color: #f28f8a;
                }
                .resto-categories {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    padding: 16px;
                    margin-top: 24px;
                }
                .resto-section-title {
                    font-weight: 700;
                    margin-bottom: 12px;
                }
                .resto-cat-grid {
                    display: grid;
                    gap: 10px;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                }
                .resto-cat-card {
                    background: rgba(0, 0, 0, 0.25);
                    border-radius: 12px;
                    padding: 12px 14px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-dark .modal-content {
                    background: #140808;
                    border: 1px solid rgba(212,74,66,0.25);
                    color: #fff;
                    border-radius: 20px;
                }
                .modal-dark .modal-header {
                    border-bottom: none;
                    border-radius: 20px 20px 0 0;
                }
                .modal-dark .modal-body {
                    background: #140808;
                    padding: 1.5rem;
                }
                .modal-dark .modal-footer {
                    background: #140808;
                    border-top: 1px solid rgba(255,255,255,0.08);
                    border-radius: 0 0 20px 20px;
                    padding: 1rem 1.5rem;
                }
                .modal-dark .form-label {
                    color: rgba(255,255,255,0.65);
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 6px;
                }
                .modal-dark .form-control,
                .modal-dark .form-select {
                    background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: #fff;
                    border-radius: 10px;
                }
                .modal-dark .form-control:focus,
                .modal-dark .form-select:focus {
                    background: rgba(255,255,255,0.1);
                    border-color: rgba(192,57,43,0.7);
                    color: #fff;
                    box-shadow: 0 0 0 3px rgba(192,57,43,0.15);
                }
                .modal-dark .form-control::placeholder {
                    color: rgba(255,255,255,0.3);
                }
                .modal-dark .form-select option {
                    background: #1a0a0a;
                    color: #fff;
                }
                .modal-dark .text-muted {
                    color: rgba(255,255,255,0.4) !important;
                }
                .modal-dark .btn-secondary {
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: #fff;
                    border-radius: 10px;
                    font-weight: 600;
                }
                .modal-dark .btn-secondary:hover {
                    background: rgba(255,255,255,0.13);
                    color: #fff;
                }
                .modal-dark .btn-close-white {
                    filter: invert(1);
                }
                @media (max-width: 900px) {
                    .resto-table-header,
                    .resto-row {
                        grid-template-columns: 1fr;
                        gap: 6px;
                    }
                    .resto-row-actions {
                        justify-content: flex-start;
                    }
                }
            `}</style>

            <CategoryModal 
                show={showCategoryForm}
                onClose={closeCategoryForm}
                onSubmit={handleCategorySubmit}
                editing={!!editingCategory}
                initialData={categoryData}
                adminGradient={adminGradient}
            />
            
            <ProductModal 
                show={showProductForm}
                onClose={closeProductForm}
                onSubmit={handleProductSubmit}
                editing={!!editingProduct}
                initialData={productData}
                categories={categories}
                adminGradient={adminGradient}
            />
            
            <ExtrasModal 
                show={showExtrasForm}
                onClose={closeExtrasForm}
                product={selectedProduct}
                productOptions={selectedProduct ? getOptionsForProduct(selectedProduct.id) : []}
                onOptionsChanged={() => {
                    if (selectedProduct) {
                        refreshOptionsForProduct(selectedProduct.id);
                    }
                }}
                adminGradient={adminGradient}
            />
        </AdminShell>
    );
}