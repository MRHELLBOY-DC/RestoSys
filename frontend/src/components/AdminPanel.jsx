import { useState, useEffect, useCallback } from 'react';
import {
    getProducts, createProduct, updateProduct, deleteProduct,
    getCategories, createCategory, updateCategory, deleteCategory
} from '../services/menuApi';
import '../styles.css';


export default function AdminPanel() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', price: '', category: '' });
    const [categoryForm, setCategoryForm] = useState({ name: '' });

    const loadData = useCallback(async () => {
        try {
            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getCategories()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar datos cuando el componente se monta
    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await updateProduct(editing, form);
                alert('Producto actualizado');
            } else {
                await createProduct(form);
                alert('Producto creado');
            }
            setForm({ name: '', price: '', category: '' });
            setEditing(null);
            await loadData();
        } catch (err) {
            console.error('Error:', err);
            alert('Error: ' + JSON.stringify(err));
        }
    };

    const handleDeleteProduct = async (id) => {
        if (window.confirm('¿Eliminar producto?')) {
            try {
                await deleteProduct(id);
                await loadData();
                alert('Producto eliminado');
            } catch (err) {
                console.error('Error:', err);
                alert('Error al eliminar');
            }
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await updateCategory(editing, categoryForm);
                alert('Categoría actualizada');
            } else {
                await createCategory(categoryForm);
                alert('Categoría creada');
            }
            setCategoryForm({ name: '' });
            setEditing(null);
            await loadData();
        } catch (err) {
            console.error('Error:', err);
            alert('Error: ' + JSON.stringify(err));
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('¿Eliminar categoría? Esto eliminará todos sus productos')) {
            try {
                await deleteCategory(id);
                await loadData();
                alert('Categoría eliminada');
            } catch (err) {
                console.error('Error:', err);
                alert('Error al eliminar');
            }
        }
    };

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando productos y categorías...</div>;
    }

    return (
        <div className="admin-panel">
            <h1>Panel de Administración</h1>
            
            <div className="tabs">
                <button onClick={() => { 
                    setActiveTab('products'); 
                    setEditing(null); 
                    setForm({ name: '', price: '', category: '' }); 
                }}>
                    Productos
                </button>
                <button onClick={() => { 
                    setActiveTab('categories'); 
                    setEditing(null); 
                    setCategoryForm({ name: '' }); 
                }}>
                    Categorías
                </button>
            </div>

            {activeTab === 'products' && (
                <div>
                    <h2>Gestión de Productos</h2>
                    
                    <form onSubmit={handleProductSubmit} className="form">
                        <input
                            type="text"
                            placeholder="Nombre del producto"
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                            required
                        />
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Precio"
                            value={form.price}
                            onChange={e => setForm({...form, price: e.target.value})}
                            required
                        />
                        <select
                            value={form.category}
                            onChange={e => setForm({...form, category: e.target.value})}
                            required
                        >
                            <option value="">Seleccionar categoría</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <button type="submit">{editing ? 'Actualizar' : 'Crear Producto'}</button>
                        {editing && (
                            <button type="button" onClick={() => { 
                                setEditing(null); 
                                setForm({ name: '', price: '', category: '' }); 
                            }}>
                                Cancelar
                            </button>
                        )}
                    </form>

                    <div className="items-list">
                        <h3>Productos existentes</h3>
                        {products.length === 0 ? (
                            <p>No hay productos. Crea el primero!</p>
                        ) : (
                            products.map(p => {
                                const category = categories.find(c => c.id === p.category);
                                return (
                                    <div key={p.id} className="item-card">
                                        <div className="item-info">
                                            <strong>{p.name}</strong> - ${p.price}
                                            <br />
                                            <small>Categoría: {category?.name || 'Sin categoría'}</small>
                                        </div>
                                        <div className="item-actions">
                                            <button onClick={() => {
                                                setEditing(p.id);
                                                setForm({ 
                                                    name: p.name, 
                                                    price: p.price, 
                                                    category: p.category 
                                                });
                                            }}>
                                                Editar
                                            </button>
                                            <button onClick={() => handleDeleteProduct(p.id)}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div>
                    <h2>Gestión de Categorías</h2>
                    
                    <form onSubmit={handleCategorySubmit} className="form">
                        <input
                            type="text"
                            placeholder="Nombre de la categoría"
                            value={categoryForm.name}
                            onChange={e => setCategoryForm({...categoryForm, name: e.target.value})}
                            required
                        />
                        <button type="submit">{editing ? 'Actualizar' : 'Crear Categoría'}</button>
                        {editing && (
                            <button type="button" onClick={() => { 
                                setEditing(null); 
                                setCategoryForm({ name: '' }); 
                            }}>
                                Cancelar
                            </button>
                        )}
                    </form>

                    <div className="items-list">
                        <h3>Categorías existentes</h3>
                        {categories.length === 0 ? (
                            <p>No hay categorías. Crea la primera!</p>
                        ) : (
                            categories.map(c => (
                                <div key={c.id} className="item-card">
                                    <div className="item-info">
                                        <strong>{c.name}</strong>
                                        <br />
                                        <small>{products.filter(p => p.category === c.id).length} productos</small>
                                    </div>
                                    <div className="item-actions">
                                        <button onClick={() => {
                                            setEditing(c.id);
                                            setCategoryForm({ name: c.name });
                                        }}>
                                            Editar
                                        </button>
                                        <button onClick={() => handleDeleteCategory(c.id)}>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}