/* eslint-disable no-unused-vars, no-undef */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { getCurrentUser } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
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
    createOption,
    updateOption,
    deleteOption
} from "../../services/menuApi";
import { useNavigate } from "react-router-dom";
import RestauranteShell from "../../components/RestauranteShell";

// Modal Category Component
const CategoryModal = ({ show, onClose, onSubmit, editing, initialData, adminGradient }) => {
    const [name, setName] = useState('');
    
    useEffect(() => {
        if (show) {
            if (editing && initialData) {
                setName(initialData.name || '');
            } else {
                setName('');
            }
        }
    }, [editing, initialData, show]);
    
    if (!show) return null;
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name });
        onClose();
    };
    
    return (
        <div className="modal modal-dark show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={{ borderRadius: '20px' }}>
                    <div className="modal-header" style={{ background: adminGradient, color: 'white', borderBottom: 'none' }}>
                        <h5 className="modal-title fw-bold">{editing ? 'Editar' : 'Agregar'} Categoría</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <input
                                type="text"
                                className="form-control form-control-lg"
                                placeholder="Nombre de la categoría"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn" style={{ background: adminGradient, color: 'white' }}>Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Modal Product Component
const ProductModal = ({ show, onClose, onSubmit, editing, initialData, categories, adminGradient }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        image: null
    });
    
    // Actualizar cuando se abre el modal o cambia initialData
    useEffect(() => {
        if (show) {
            if (editing && initialData) {
                setFormData({
                    name: initialData.name || '',
                    price: initialData.price || '',
                    description: initialData.description || '',
                    category: initialData.category ? String(initialData.category) : '',
                    image: null
                });
            } else {
                setFormData({
                    name: '',
                    price: '',
                    description: '',
                    category: '',
                    image: null
                });
            }
        }
    }, [editing, initialData, show]);
    
    if (!show) return null;
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };
    
    return (
        <div className="modal modal-dark show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content" style={{ borderRadius: '20px' }}>
                    <div className="modal-header" style={{ background: adminGradient, color: 'white', borderBottom: 'none' }}>
                        <h5 className="modal-title fw-bold">{editing ? 'Editar' : 'Agregar'} Producto</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Nombre del producto</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Ej: Pizza Margherita"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Precio</label>
                                    <input
                                        type="number"
                                        name="price"
                                        step="0.01"
                                        className="form-control"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Categoría</label>
                                    <select
                                        name="category"
                                        className="form-select"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccionar Categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Descripción</label>
                                <textarea
                                    name="description"
                                    className="form-control"
                                    placeholder="Describe el producto..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Imagen del producto</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                {editing && initialData?.image && (
                                    <div className="mt-2 d-flex align-items-center gap-2">
                                        <img
                                            src={`http://localhost:8001${initialData.image}`}
                                            alt="Imagen actual"
                                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)' }}
                                        />
                                        <small className="text-muted">Dejar vacío para mantener la imagen actual</small>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn" style={{ background: adminGradient, color: 'white' }}>Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Modal Option Component
const OptionModal = ({ show, onClose, onSubmit, editing, initialData, products, adminGradient }) => {
    const [formData, setFormData] = useState({
        name: '',
        extra_price: '',
        product: ''
    });
    
    useEffect(() => {
        if (show) {
            if (editing && initialData) {
                setFormData({
                    name: initialData.name || '',
                    extra_price: initialData.extra_price || '',
                    product: initialData.product ? String(initialData.product) : ''
                });
            } else {
                setFormData({
                    name: '',
                    extra_price: '',
                    product: initialData?.product ? String(initialData.product) : ''
                });
            }
        }
    }, [editing, initialData, show]);
    
    if (!show) return null;
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };
    
    return (
        <div className="modal modal-dark show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={{ borderRadius: '20px' }}>
                    <div className="modal-header" style={{ background: adminGradient, color: 'white', borderBottom: 'none' }}>
                        <h5 className="modal-title fw-bold">{editing ? 'Editar' : 'Agregar'} Opción</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Nombre de la opción</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-control"
                                    placeholder="Ej: Extra queso"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Precio extra</label>
                                <input
                                    type="number"
                                    name="extra_price"
                                    step="0.01"
                                    className="form-control"
                                    placeholder="0.00"
                                    value={formData.extra_price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Producto</label>
                                <select
                                    name="product"
                                    className="form-select"
                                    value={formData.product}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccionar Producto</option>
                                    {products.map(prod => (
                                        <option key={prod.id} value={prod.id}>{prod.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn" style={{ background: adminGradient, color: 'white' }}>Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

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

// Componente principal
export default function RestauranteMenu() {
    const { user, loading } = useAuth(['restaurante']);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [options, setOptions] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const navigate = useNavigate();

    // Estados para formularios
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [showProductForm, setShowProductForm] = useState(false);
    const [showOptionForm, setShowOptionForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingOption, setEditingOption] = useState(null);

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

    // Degradado personalizado
    const adminGradient = 'linear-gradient(135deg, #c0392b 0%, #7b1d1d 100%)';

    // Control de modales
    const openCategoryForm = () => {
        setEditingCategory(null);
        setCategoryData({ name: '' });
        setShowCategoryForm(true);
    };

    const closeCategoryForm = () => {
        setShowCategoryForm(false);
        setEditingCategory(null);
        setCategoryData({ name: '' });
    };

    const openProductForm = () => {
        setEditingProduct(null);
        setProductData({ name: '', price: '', description: '', category: '', image: null });
        setShowProductForm(true);
    };

    const closeProductForm = () => {
        setShowProductForm(false);
        setEditingProduct(null);
        setProductData({ name: '', price: '', description: '', category: '', image: null });
    };

    const openOptionForm = () => {
        setEditingOption(null);
        setOptionData({ name: '', extra_price: '', product: '' });
        setShowOptionForm(true);
    };

    const closeOptionForm = () => {
        setShowOptionForm(false);
        setEditingOption(null);
        setOptionData({ name: '', extra_price: '', product: '' });
    };

   const loadData = async () => {
    try {
        // 1. Cargar categorías y productos
        const [cats, prods] = await Promise.all([
            getCategories(),
            getProducts()
        ]);
        setCategories(cats);
        setProducts(prods);
        
        // 2. Cargar opciones para cada producto (uno por uno)
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
    } finally {
        setLoadingData(false);
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
                alert("Categoría actualizada");
            } else {
                await createCategory(data);
                alert("Categoría creada");
            }
            await loadData();
            closeCategoryForm();
        } catch (error) {
            console.error('Error saving category:', error);
            alert("Error al guardar la categoría");
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
                alert("Categoría eliminada");
                await loadData();
            } catch (error) {
                console.error('Error deleting category:', error);
                alert("Error al eliminar la categoría");
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
                alert("Producto actualizado");
            } else {
                await createProduct(productToSend);
                alert("Producto creado");
            }
            
            await loadData();
            closeProductForm();
        } catch (error) {
            console.error('Error saving product:', error);
            alert(error.error || "Error al guardar el producto");
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
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('¿Eliminar producto?')) {
            try {
                await deleteProduct(id);
                alert("Producto eliminado");
                await loadData();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert("Error al eliminar el producto");
            }
        }
    };

    // ========== OPCIONES ==========
const handleOptionSubmit = async (data) => {
    if (!data.product) {
        alert("Selecciona un producto primero");
        return;
    }
    
    try {
        const productId = parseInt(data.product);
        
        if (editingOption) {
            await updateOption(editingOption.id, {
                name: data.name,
                extra_price: parseFloat(data.extra_price)
            });
            alert("Opción actualizada");
        } else {
            await createOption({
                name: data.name,
                extra_price: parseFloat(data.extra_price),
                product_id: productId
            });
            alert("Opción creada");
        }
        
        // Recargar SOLO las opciones del producto afectado
        const nuevasOpcionesDelProducto = await getOptions(productId);
        
        // Actualizar el estado: mantener opciones de otros productos y actualizar las del producto modificado
        setOptions(prevOptions => {
            // Filtrar las opciones que NO son del producto que cambió
            const otrasOpciones = prevOptions.filter(opt => opt.product_id !== productId);
            // Unir con las nuevas opciones del producto
            return [...otrasOpciones, ...nuevasOpcionesDelProducto];
        });
        
        closeOptionForm();
    } catch (error) {
        console.error("Error saving option:", error);
        alert("Error al guardar la opción");
    }
};

    const handleEditOption = (option) => {
        setEditingOption(option);
        setOptionData({ 
            name: option.name, 
            extra_price: option.extra_price, 
            product: option.product_id 
        });
        setShowOptionForm(true);
    };

const handleDeleteOption = async (id) => {
    if (window.confirm('¿Eliminar opción?')) {
        try {
            // Obtener el product_id antes de eliminar
            const optionToDelete = options.find(opt => opt.id === id);
            const productId = optionToDelete?.product_id;
            
            await deleteOption(id);
            alert("Opción eliminada");
            
            if (productId) {
                // Recargar opciones del producto afectado
                const nuevasOpciones = await getOptions(productId);
                setOptions(prevOptions => {
                    const otrasOpciones = prevOptions.filter(opt => opt.product_id !== productId);
                    return [...otrasOpciones, ...nuevasOpciones];
                });
            } else {
                // Si no sabemos el producto, recargar todo
                await loadData();
            }
        } catch (error) {
            console.error('Error deleting option:', error);
            alert("Error al eliminar la opción");
        }
    }
};

    if (loading || loadingData) {
        return (
            <RestauranteShell title="Gestion de menu" subtitle="Cargando gestion de menu...">
                <div className="d-flex align-items-center justify-content-center text-white" style={{ minHeight: "60vh" }}>
                    <div className="spinner-border text-light me-2" role="status"></div>
                    <p className="mb-0 fw-bold">Cargando gestion de menu...</p>
                </div>
            </RestauranteShell>
        );
    }

    if (!user) return null;

    const categoriesMap = categories.reduce((map, cat) => {
        map.set(cat.id, cat.name);
        return map;
    }, new Map());

    const extrasCount = (productId) => options.filter((opt) => opt.product_id === productId).length;

    return (
        <RestauranteShell
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
            <div className="resto-table">
                <div className="resto-table-header">
                    <span>Producto</span>
                    <span>Categoria</span>
                    <span>Precio</span>
                    <span>Extras</span>
                    <span></span>
                </div>
                {products.length === 0 ? (
                    <div className="resto-empty">No hay productos cargados.</div>
                ) : (
                    products.map((prod) => (
                        <div key={prod.id} className="resto-row">
                            <div className="resto-product">
                                <div className="resto-thumb">
                                    {prod.image ? (
                                        <img src={`http://localhost:8001${prod.image}`} alt={prod.name} />
                                    ) : (
                                        <div className="resto-thumb-fallback">
                                            <i className={`fa ${getFoodIcon(prod.name, categoriesMap.get(prod.category_id))}`} />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="resto-name">{prod.name}</div>
                                    <div className="resto-muted">{prod.description || "Sin descripcion"}</div>
                                </div>
                            </div>
                            <div className="resto-muted">{categoriesMap.get(prod.category_id) || "-"}</div>
                            <div className="resto-price">S/ {Number(prod.price).toFixed(2)}</div>
                            <div className="resto-muted">{extrasCount(prod.id)}</div>
                            <div className="resto-row-actions">
                                <button className="resto-icon-btn" type="button" onClick={() => handleEditProduct(prod)}>Editar</button>
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
                    grid-template-columns: 2fr 1fr 0.7fr 0.5fr 0.8fr;
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
                .resto-product {
                    display: flex;
                    gap: 12px;
                    align-items: center;
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
            
            <OptionModal 
                show={showOptionForm}
                onClose={closeOptionForm}
                onSubmit={handleOptionSubmit}
                editing={!!editingOption}
                initialData={optionData}
                products={products}
                adminGradient={adminGradient}
            />
        </RestauranteShell>
    );
}