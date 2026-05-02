import { useEffect, useState } from "react";
/* eslint-disable no-unused-vars, no-undef */
import { getCurrentUser } from "../../services/api";
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

    // Degradado personalizado para identificar el panel administrativo
    const adminGradient = 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)';

    // Funciones de reset
    const resetCategoryForm = () => {
        setCategoryData({ name: '' });
        setEditingCategory(null);
        setShowCategoryForm(false);
    };

    const resetProductForm = () => {
        setProductData({ name: '', price: '', description: '', category: '', image: null });
        setEditingProduct(null);
        setShowProductForm(false);
    };

    const resetOptionForm = () => {
        setOptionData({ name: '', extra_price: '', product: '' });
        setEditingOption(null);
        setShowOptionForm(false);
    };

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
            const [cats, prods] = await Promise.all([
                getCategories(),
                getProducts()
            ]);
            setCategories(cats);
            setProducts(prods);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

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
                alert("Categoría actualizada");
            } else {
                await createCategory(categoryData);
                alert("Categoría creada");
            }
            loadData();
            resetCategoryForm();
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
                loadData();
            } catch (error) {
                console.error('Error deleting category:', error);
                alert("Error al eliminar la categoría");
            }
        }
    };

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
                productToSend = new FormData();
                productToSend.append('name', nameValue);
                productToSend.append('price', priceValue);
                productToSend.append('category_id', categoryValue);
                productToSend.append('description', productData.description || '');
                productToSend.append('image', productData.image);
            } else {
                productToSend = {
                    name: nameValue,
                    price: priceValue,
                    category_id: categoryValue,
                    description: productData.description || "",
                };
            }
            
            if (editingProduct) {
                await updateProduct(editingProduct.id, productToSend);
                alert("Producto actualizado");
            } else {
                await createProduct(productToSend);
                alert("Producto creado");
            }
            
            resetProductForm();
            loadData();
        } catch (error) {
            console.error('Error saving product:', error);
            alert(error.error || "Error al guardar el producto");
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setSelectedProductId(product.id);
        setProductData({
            name: product.name || '',
            price: product.price ? product.price.toString() : '',
            description: product.description || '',
            category: product.category_id ? product.category_id.toString() : '',
            image: null
        });
        setShowProductForm(true);
        loadOptionsForProduct(product.id);
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('¿Eliminar producto?')) {
            try {
                await deleteProduct(id);
                alert("Producto eliminado");
                loadData();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert("Error al eliminar el producto");
            }
        }
    };

    // ========== OPCIONES ==========
    const handleOptionSubmit = async (e) => {
        e.preventDefault();
        
        if (!optionData.product) {
            alert("Selecciona un producto primero");
            return;
        }
        
        try {
            if (editingOption) {
                await updateOption(editingOption.id, {
                    name: optionData.name,
                    extra_price: parseFloat(optionData.extra_price)
                });
                alert("Opción actualizada");
            } else {
                await createOption({
                    name: optionData.name,
                    extra_price: parseFloat(optionData.extra_price),
                    product_id: parseInt(optionData.product)
                });
                alert("Opción creada");
            }
            
            resetOptionForm();
            
            if (selectedProductId) {
                const updatedOptions = await getOptions(selectedProductId);
                setOptions(updatedOptions);
            }
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
                await deleteOption(id);
                alert("Opción eliminada");
                if (selectedProductId) {
                    const updatedOptions = await getOptions(selectedProductId);
                    setOptions(updatedOptions);
                }
            } catch (error) {
                console.error('Error deleting option:', error);
                alert("Error al eliminar la opción");
            }
        }
    };

    if (loading) {
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

    // Modal Category Component
    const CategoryModal = () => (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={resetCategoryForm}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content" style={{ borderRadius: '20px' }}>
                    <div className="modal-header" style={{ background: adminGradient, color: 'white', borderBottom: 'none' }}>
                        <h5 className="modal-title fw-bold">{editingCategory ? 'Editar' : 'Agregar'} Categoría</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={resetCategoryForm}></button>
                    </div>
                    <form onSubmit={handleCategorySubmit}>
                        <div className="modal-body">
                            <input
                                type="text"
                                className="form-control form-control-lg"
                                placeholder="Nombre de la categoría"
                                value={categoryData.name}
                                onChange={(e) => setCategoryData({...categoryData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={resetCategoryForm}>Cancelar</button>
                            <button type="submit" className="btn" style={{ background: adminGradient, color: 'white' }}>Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    // Modal Product Component
    const ProductModal = () => (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={resetProductForm}>
            <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content" style={{ borderRadius: '20px' }}>
                    <div className="modal-header" style={{ background: adminGradient, color: 'white', borderBottom: 'none' }}>
                        <h5 className="modal-title fw-bold">{editingProduct ? 'Editar' : 'Agregar'} Producto</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={resetProductForm}></button>
                    </div>
                    <form onSubmit={handleProductSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Nombre del producto</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej: Pizza Margherita"
                                    value={productData.name}
                                    onChange={(e) => setProductData({...productData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Precio</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-control"
                                        placeholder="0.00"
                                        value={productData.price}
                                        onChange={(e) => setProductData({...productData, price: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Categoría</label>
                                    <select
                                        className="form-select"
                                        value={productData.category}
                                        onChange={(e) => setProductData({...productData, category: e.target.value})}
                                        required
                                    >
                                        <option value="">Seleccionar Categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Descripción</label>
                                <textarea
                                    className="form-control"
                                    placeholder="Describe el producto..."
                                    value={productData.description}
                                    onChange={(e) => setProductData({...productData, description: e.target.value})}
                                    rows="3"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Imagen del producto</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={(e) => setProductData({...productData, image: e.target.files[0]})}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={resetProductForm}>Cancelar</button>
                            <button type="submit" className="btn" style={{ background: adminGradient, color: 'white' }}>Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    // Modal Option Component
    const OptionModal = () => (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={resetOptionForm}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content" style={{ borderRadius: '20px' }}>
                    <div className="modal-header" style={{ background: adminGradient, color: 'white', borderBottom: 'none' }}>
                        <h5 className="modal-title fw-bold">{editingOption ? 'Editar' : 'Agregar'} Opción</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={resetOptionForm}></button>
                    </div>
                    <form onSubmit={handleOptionSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Nombre de la opción</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ej: Extra queso"
                                    value={optionData.name}
                                    onChange={(e) => setOptionData({...optionData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Precio extra</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="form-control"
                                    placeholder="0.00"
                                    value={optionData.extra_price}
                                    onChange={(e) => setOptionData({...optionData, extra_price: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Producto</label>
                                <select
                                    className="form-select"
                                    value={optionData.product}
                                    onChange={(e) => setOptionData({...optionData, product: e.target.value})}
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
                            <button type="button" className="btn btn-secondary" onClick={resetOptionForm}>Cancelar</button>
                            <button type="submit" className="btn" style={{ background: adminGradient, color: 'white' }}>Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

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
                        <h2 className="text-white mb-0 fw-bold">
                            <span className="me-2"></span> Categorías
                        </h2>
                        <button 
                            className="btn btn-light rounded-pill px-4 fw-bold"
                            onClick={() => {
                                resetCategoryForm();
                                setShowCategoryForm(true);
                            }}
                        >
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
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary rounded-pill me-2"
                                                        onClick={() => handleEditCategory(cat)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger rounded-pill"
                                                        onClick={() => handleDeleteCategory(cat.id)}
                                                    >
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

                {/* Sección de Productos */}
                <div className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="text-white mb-0 fw-bold">
                            <span className="me-2"></span> Productos
                        </h2>
                        <button 
                            className="btn btn-light rounded-pill px-4 fw-bold"
                            onClick={() => {
                                resetProductForm();
                                setShowProductForm(true);
                            }}
                        >
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
                            products.map(prod => (
                                <div key={prod.id} className="col-12 col-md-6 col-lg-4">
                                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px', background: 'rgba(255, 255, 255, 0.95)', transition: 'all 0.3s ease' }}>
                                        {prod.image && (
                                            <img 
                                                src={`http://localhost:8001${prod.image}`} 
                                                alt={prod.name}
                                                className="card-img-top"
                                                style={{ height: '200px', objectFit: 'cover', borderRadius: '20px 20px 0 0' }}
                                            />
                                        )}
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h5 className="card-title fw-bold mb-0">{prod.name}</h5>
                                                <span className="badge fs-6 px-3 py-2" style={{ background: adminGradient }}>
                                                    ${prod.price}
                                                </span>
                                            </div>
                                            {prod.description && (
                                                <p className="card-text text-muted small">{prod.description}</p>
                                            )}
                                        </div>
                                        <div className="card-footer bg-transparent border-0 pb-3">
                                            <div className="btn-group w-100">
                                                <button 
                                                    className="btn btn-outline-primary rounded-pill me-2"
                                                    onClick={() => handleEditProduct(prod)}
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    className="btn btn-outline-danger rounded-pill"
                                                    onClick={() => handleDeleteProduct(prod.id)}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sección de Opciones */}
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="text-white mb-0 fw-bold">
                            <span className="me-2"></span> Opciones de Producto
                        </h2>
                        <button 
                            className="btn btn-light rounded-pill px-4 fw-bold"
                            onClick={() => {
                                resetOptionForm();
                                setShowOptionForm(true);
                            }}
                        >
                            + Agregar Opción
                        </button>
                    </div>
                    
                    <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', background: 'rgba(255, 255, 255, 0.95)' }}>
                        <div className="card-body p-4">
                            {options.length === 0 ? (
                                <p className="text-muted text-center mb-0">No hay opciones para este producto.</p>
                            ) : (
                                <div className="row g-3">
                                    {options.map(opt => (
                                        <div key={opt.id} className="col-12 col-md-6 col-lg-4">
                                            <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                                                <div>
                                                    <span className="fw-bold">{opt.name}</span>
                                                    <span className="badge ms-2" style={{ background: adminGradient }}>
                                                        +${opt.extra_price}
                                                    </span>
                                                </div>
                                                <div className="btn-group">
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary rounded-pill me-2"
                                                        onClick={() => handleEditOption(opt)}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger rounded-pill"
                                                        onClick={() => handleDeleteOption(opt.id)}
                                                    >
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
            </div>

            {/* Modales */}
            {showCategoryForm && <CategoryModal />}
            {showProductForm && <ProductModal />}
            {showOptionForm && <OptionModal />}
        </div>
    );
}