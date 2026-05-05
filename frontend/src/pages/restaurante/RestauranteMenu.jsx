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
import DashboardNavbar from "../../components/DashboardNavbar";

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
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                                    <small className="text-muted d-block mt-1">
                                        Imagen actual: {initialData.image}
                                    </small>
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
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
    const adminGradient = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)';

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
            <div className="min-vh-100 d-flex flex-column" style={{ background: adminGradient }}>
                <DashboardNavbar />
                <div className="flex-grow-1 d-flex align-items-center justify-content-center text-white">
                    <div className="spinner-border text-light me-2" role="status"></div>
                    <p className="mb-0 fw-bold">Cargando gestión de menú...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: adminGradient }}>
            <DashboardNavbar />
            
            <div className="container py-5">
                {/* Cabecera del Panel */}
                <div className="text-white mb-5">
                    <h1 className="display-4 fw-bold mb-1">Gestión de Menú</h1>
                    <div className="d-inline-flex align-items-center bg-white bg-opacity-10 px-3 py-2 rounded-pill border border-white border-opacity-25">
                        <span className="fs-5">{user.restaurant?.name || 'Establecimiento No Asignado'}</span>
                    </div>
                </div>

                {/* Sección de Categorías */}
                <div className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="text-white mb-0 fw-bold">Categorías</h2>
                        <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={openCategoryForm}>
                            + Agregar Categoría
                        </button>
                    </div>
                    
                    <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', background: 'rgba(255, 255, 255, 0.95)' }}>
                        <div className="card-body p-4">
                            {categories.length === 0 ? (
                                <p className="text-muted text-center mb-0">No hay categorías. ¡Crea la primera!</p>
                            ) : (
                                <div className="row g-3">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="col-12 col-md-6 col-lg-4">
                                            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                                                <span className="fw-bold fs-5">{cat.name}</span>
                                                <div className="btn-group">
                                                    <button className="btn btn-sm btn-outline-primary rounded-pill me-2" onClick={() => handleEditCategory(cat)}>
                                                        Editar
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger rounded-pill" onClick={() => handleDeleteCategory(cat.id)}>
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sección de Productos con Opciones dentro */}
                <div className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="text-white mb-0 fw-bold">Productos</h2>
                        <button className="btn btn-light rounded-pill px-4 fw-bold" onClick={openProductForm}>
                            + Agregar Producto
                        </button>
                    </div>
                    
                    <div className="row g-4">
                        {products.length === 0 ? (
                            <div className="col-12">
                                <div className="card border-0 shadow-lg text-center p-5" style={{ borderRadius: '20px', background: 'rgba(255, 255, 255, 0.95)' }}>
                                    <p className="text-muted mb-0">No hay productos. ¡Crea el primero!</p>
                                </div>
                            </div>
                        ) : (
                            products.map(prod => {
                                const productOptions = options.filter(opt => opt.product_id === prod.id);
                                return (
                                    <div key={prod.id} className="col-12 col-md-6 col-lg-4">
                                        <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px', background: 'rgba(255, 255, 255, 0.95)' }}>
                                            {prod.image && (
                                                <img 
                                                    src={`http://localhost:8001${prod.image}`} 
                                                    alt={prod.name}
                                                    className="card-img-top"
                                                    style={{ height: '180px', objectFit: 'cover', borderRadius: '20px 20px 0 0' }}
                                                />
                                            )}
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h5 className="card-title fw-bold mb-0">{prod.name}</h5>
                                                    <span className="badge fs-6 px-3 py-2" style={{ background: adminGradient }}>${prod.price}</span>
                                                </div>
                                                {prod.description && <p className="card-text text-muted small mb-2">{prod.description}</p>}
                                                
                                                {/* Opciones dentro del producto */}
                                                <div className="mt-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <small className="text-muted fw-bold">Extras:</small>
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary rounded-pill"
                                                            onClick={() => {
                                                                setEditingOption(null);
                                                                setOptionData({ 
                                                                    name: '', 
                                                                    extra_price: '', 
                                                                    product: prod.id 
                                                                });
                                                                setShowOptionForm(true);
                                                            }}
                                                        >
                                                            + Agregar Extra
                                                        </button>
                                                    </div>
                                                    {productOptions.length === 0 ? (
                                                        <small className="text-muted">Sin extras</small>
                                                    ) : (
                                                        productOptions.map(opt => (
                                                            <div key={opt.id} className="d-flex justify-content-between align-items-center small bg-light p-2 rounded mb-1">
                                                                <span>{opt.name}</span>
                                                                <span className="text-primary">+${opt.extra_price}</span>
                                                                <div className="btn-group btn-group-sm">
                                                                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditOption(opt)}>✏️</button>
                                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteOption(opt.id)}>🗑️</button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                            <div className="card-footer bg-transparent border-0 pb-3">
                                                <div className="btn-group w-100">
                                                    <button className="btn btn-outline-primary rounded-pill me-2" onClick={() => handleEditProduct(prod)}>
                                                        Editar Producto
                                                    </button>
                                                    <button className="btn btn-outline-danger rounded-pill" onClick={() => handleDeleteProduct(prod.id)}>
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Modales */}
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
        </div>
    );
}