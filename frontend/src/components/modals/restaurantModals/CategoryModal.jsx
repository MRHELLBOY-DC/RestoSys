// src/pages/restaurante/modals/CategoryModal.jsx
import { useState, useEffect } from "react";

export const CategoryModal = ({ show, onClose, onSubmit, editing, initialData, adminGradient }) => {
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