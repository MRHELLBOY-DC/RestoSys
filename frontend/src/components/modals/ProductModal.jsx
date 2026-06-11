// src/pages/restaurante/modals/ProductModal.jsx
import { useState, useEffect } from "react";

export const ProductModal = ({ show, onClose, onSubmit, editing, initialData, categories, adminGradient }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        image: null
    });
    
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