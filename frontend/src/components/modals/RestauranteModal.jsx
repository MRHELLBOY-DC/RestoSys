// src/components/modals/RestauranteModal.jsx
import { useEffect, useRef } from "react";

export default function RestauranteModal({ 
    isOpen, 
    onClose, 
    onSubmit, 
    editing, 
    form, 
    setForm 
}) {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '1rem'
        }}>
            <div ref={modalRef} className="admin-card admin-card--glass" style={{
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                margin: 0
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <h3 className="h5 fw-bold mb-0 text-white">{editing ? "Editar" : "Nuevo"} Restaurante</h3>
                    <button 
                        type="button" 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            fontSize: '1.8rem',
                            cursor: 'pointer',
                            padding: '0 0.5rem',
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>
                
                <form onSubmit={onSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-white">Nombre</label>
                        <input
                            type="text"
                            className="form-control admin-input"
                            placeholder="Ej: La Pizzeria"
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label small fw-bold text-white">Direccion</label>
                        <input
                            type="text"
                            className="form-control admin-input"
                            placeholder="Ej: Av. Principal 123"
                            value={form.address}
                            onChange={e => setForm({...form, address: e.target.value})}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label small fw-bold text-white">Logo</label>
                        <input
                            type="file"
                            className="form-control admin-input"
                            accept="image/*"
                            onChange={e => setForm({...form, logo: e.target.files[0]})}
                        />
                    </div>
                    <div className="d-grid gap-2">
                        <button type="submit" className="admin-btn admin-btn-primary">
                            {editing ? "Actualizar" : "Crear"}
                        </button>
                        {editing && (
                            <button type="button" className="admin-btn admin-btn-ghost" onClick={onClose}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}