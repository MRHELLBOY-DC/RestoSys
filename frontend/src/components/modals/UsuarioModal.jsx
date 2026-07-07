// src/components/modals/UsuarioModal.jsx
import { useEffect, useRef } from "react";

export default function UsuarioModal({
    isOpen,
    onClose,
    onSubmit,
    editing,
    form,
    setForm,
    restaurantes,
    loading,
    restrictToEmpleadoRepartidor = false
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
                    <h3 className="h5 fw-bold mb-0 text-white">{editing ? "Editar" : "Nuevo"} Usuario</h3>
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
                        <label className="form-label small fw-bold text-white">Nombre completo</label>
                        <input
                            type="text"
                            className="form-control admin-input"
                            placeholder="Ej: Juan Pérez"
                            value={form.full_name}
                            onChange={e => setForm({...form, full_name: e.target.value})}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-white">Email</label>
                        <input
                            type="email"
                            className="form-control admin-input"
                            placeholder="usuario@ejemplo.com"
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                            required
                        />
                    </div>

                    {!editing && (
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-white">Contraseña</label>
                            <input
                                type="password"
                                className="form-control admin-input"
                                placeholder="Mínimo 6 caracteres"
                                value={form.password}
                                onChange={e => setForm({...form, password: e.target.value})}
                                required
                            />
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label small fw-bold text-white">Rol de acceso</label>
                        <select
                            className="form-select admin-select"
                            value={form.role}
                            onChange={e => setForm({
                                ...form,
                                role: e.target.value,
                                restaurante_id: (e.target.value === 'cliente' || e.target.value === 'admin') ? "" : form.restaurante_id
                            })}
                        >
                            <option value="empleado" className="bg-dark text-white">Empleado</option>
                            <option value="repartidor" className="bg-dark text-white">Repartidor</option>
                            {!restrictToEmpleadoRepartidor && (
                                <>
                                    <option value="cliente" className="bg-dark text-white">Cliente</option>
                                    <option value="restaurante" className="bg-dark text-white">Administrador de Restaurante</option>
                                    <option value="admin" className="bg-dark text-white">Super Administrador</option>
                                </>
                            )}
                        </select>
                    </div>

                    {form.role !== 'cliente' && form.role !== 'admin' && (
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-white">Asignar sede</label>
                            <select
                                className="form-select admin-select"
                                value={form.restaurante_id}
                                onChange={e => setForm({...form, restaurante_id: e.target.value})}
                            >
                                <option value="" className="bg-dark text-white">Sin restaurante asignado</option>
                                {restaurantes.map(r => (
                                    <option key={r.id} value={r.id} className="bg-dark text-white">{r.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="d-grid gap-2">
                        <button 
                            type="submit" 
                            className="admin-btn admin-btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Procesando...
                                </>
                            ) : (
                                editing ? "Actualizar" : "Registrar"
                            )}
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