// src/pages/restaurante/modals/ExtrasModal.jsx
import { useState, useEffect } from "react";
import { createOption, updateOption, deleteOption } from "../../../services/menuApi";

export const ExtrasModal = ({ show, onClose, product, productOptions, onOptionsChanged, adminGradient }) => {
    const [newExtras, setNewExtras] = useState([{ name: '', extra_price: '' }]);
    const [editingOption, setEditingOption] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', extra_price: '' });
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (show) {
            setNewExtras([{ name: '', extra_price: '' }]);
            setEditingOption(null);
            setEditForm({ name: '', extra_price: '' });
            setIsSaving(false);
        }
    }, [show]);
    
    if (!show || !product) return null;
    
    const isEmptyField = (extra) => {
        return extra.name.trim() === '' && extra.extra_price === '';
    };
    
    const addExtraField = () => {
        setNewExtras([...newExtras, { name: '', extra_price: '' }]);
    };
    
    const removeExtraField = (index) => {
        const updated = [...newExtras];
        updated.splice(index, 1);
        if (updated.length === 0) {
            updated.push({ name: '', extra_price: '' });
        }
        setNewExtras(updated);
    };
    
    const updateExtraField = (index, field, value) => {
        const updated = [...newExtras];
        updated[index][field] = value;
        setNewExtras(updated);
    };
    
    const handleSaveAllExtras = async () => {
        const validExtras = newExtras.filter(extra => extra.name.trim() !== '' && extra.extra_price !== '');
        
        if (validExtras.length === 0) {
            alert("Agrega al menos un extra con nombre y precio");
            return;
        }
        
        setIsSaving(true);
        
        try {
            let createdCount = 0;
            for (const extra of validExtras) {
                await createOption({
                    name: extra.name.trim(),
                    extra_price: parseFloat(extra.extra_price),
                    product_id: product.id
                });
                createdCount++;
            }
            
            alert(`${createdCount} extra(s) agregado(s) correctamente`);
            await onOptionsChanged();
            onClose();
        } catch (error) {
            console.error('Error saving extras:', error);
            alert("Error al guardar los extras");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleEditOption = (option) => {
        setEditingOption(option);
        setEditForm({
            name: option.name,
            extra_price: option.extra_price
        });
    };
    
    const handleCancelEdit = () => {
        setEditingOption(null);
        setEditForm({ name: '', extra_price: '' });
    };
    
    const handleSaveEdit = async () => {
        if (!editForm.name.trim()) {
            alert("El nombre es requerido");
            return;
        }
        
        try {
            await updateOption(editingOption.id, {
                name: editForm.name.trim(),
                extra_price: parseFloat(editForm.extra_price)
            });
            alert("Extra actualizado");
            setEditingOption(null);
            setEditForm({ name: '', extra_price: '' });
            await onOptionsChanged();
        } catch (error) {
            console.error('Error updating option:', error);
            alert("Error al actualizar el extra");
        }
    };
    
    const handleDeleteOption = async (optionId) => {
        if (!window.confirm('¿Eliminar este extra?')) return;
        
        try {
            await deleteOption(optionId);
            alert("Extra eliminado");
            await onOptionsChanged();
        } catch (error) {
            console.error('Error deleting option:', error);
            alert("Error al eliminar el extra");
        }
    };
    
    return (
        <div className="modal modal-dark show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content" style={{ borderRadius: '20px' }}>
                    <div className="modal-header" style={{ background: adminGradient, color: 'white', borderBottom: 'none' }}>
                        <h5 className="modal-title fw-bold">Extras para: {product.name}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    
                    <div className="modal-body">
                        {/* Extras existentes */}
                        <div className="mb-4">
                            <label className="form-label fw-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                Extras actuales
                            </label>
                            {productOptions.length === 0 ? (
                                <div className="text-muted" style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                    No hay extras para este producto
                                </div>
                            ) : (
                                <div className="existing-options-list">
                                    {productOptions.map(opt => (
                                        <div key={opt.id} className="existing-option-item">
                                            {editingOption?.id === opt.id ? (
                                                <div className="edit-mode">
                                                    <div className="row g-2">
                                                        <div className="col-5">
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={editForm.name}
                                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                                placeholder="Nombre"
                                                            />
                                                        </div>
                                                        <div className="col-4">
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                className="form-control form-control-sm"
                                                                value={editForm.extra_price}
                                                                onChange={(e) => setEditForm({ ...editForm, extra_price: e.target.value })}
                                                                placeholder="Precio extra"
                                                            />
                                                        </div>
                                                        <div className="col-3">
                                                            <button className="btn btn-sm btn-success me-1" onClick={handleSaveEdit}>Guardar</button>
                                                            <button className="btn btn-sm btn-secondary" onClick={handleCancelEdit}>Cancelar</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="display-mode">
                                                    <span className="option-name">{opt.name}</span>
                                                    <span className="option-price">+ S/ {parseFloat(opt.extra_price).toFixed(2)}</span>
                                                    <div className="option-actions">
                                                        <button className="btn-icon-edit" onClick={() => handleEditOption(opt)} title="Editar">✏️</button>
                                                        <button className="btn-icon-delete" onClick={() => handleDeleteOption(opt.id)} title="Eliminar">🗑️</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                        
                        {/* Nuevos extras */}
                        <div className="mb-3">
                            <label className="form-label fw-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                Agregar nuevos extras
                            </label>
                            
                            {newExtras.map((extra, index) => {
                                const showDelete = newExtras.length > 1 || !isEmptyField(extra);
                                
                                return (
                                    <div key={index} className="new-extra-row mb-2">
                                        <div className="row g-2 align-items-center">
                                            <div className="col-5">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Nombre del extra"
                                                    value={extra.name}
                                                    onChange={(e) => updateExtraField(index, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-4">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="form-control"
                                                    placeholder="Precio extra"
                                                    value={extra.extra_price}
                                                    onChange={(e) => updateExtraField(index, 'extra_price', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-3">
                                                <div className="icon-group">
                                                    {showDelete && (
                                                        <button type="button" className="btn-icon-remove" onClick={() => removeExtraField(index)} title="Eliminar este campo">🗑️</button>
                                                    )}
                                                    {index === newExtras.length - 1 && (
                                                        <button type="button" className="btn-icon-add" onClick={addExtraField} title="Agregar otro extra">➕</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="button" className="btn" style={{ background: adminGradient, color: 'white' }} onClick={handleSaveAllExtras} disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar extras'}
                        </button>
                    </div>
                </div>
            </div>
            
            <style>{`
                .existing-options-list {
                    max-height: 250px;
                    overflow-y: auto;
                }
                .existing-option-item {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    padding: 10px;
                    margin-bottom: 8px;
                }
                .display-mode {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .option-name {
                    font-weight: 600;
                    flex: 2;
                }
                .option-price {
                    color: #d44a42;
                    font-weight: 600;
                    flex: 1;
                }
                .option-actions {
                    display: flex;
                    gap: 8px;
                }
                .btn-icon-edit, .btn-icon-delete {
                    background: rgba(255, 255, 255, 0.08);
                    border: none;
                    border-radius: 8px;
                    padding: 4px 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }
                .btn-icon-edit:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: scale(1.05);
                }
                .btn-icon-delete:hover {
                    background: rgba(231, 76, 60, 0.3);
                    transform: scale(1.05);
                }
                .new-extra-row {
                    animation: fadeIn 0.2s ease;
                }
                .icon-group {
                    display: flex;
                    gap: 8px;
                }
                .btn-icon-add, .btn-icon-remove {
                    background: rgba(255, 255, 255, 0.08);
                    border: none;
                    border-radius: 8px;
                    padding: 6px 10px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.2s;
                }
                .btn-icon-add {
                    color: #2ecc71;
                }
                .btn-icon-add:hover {
                    background: rgba(46, 204, 113, 0.3);
                    transform: scale(1.05);
                }
                .btn-icon-remove {
                    color: #e74c3c;
                }
                .btn-icon-remove:hover {
                    background: rgba(231, 76, 60, 0.3);
                    transform: scale(1.05);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .modal-dark .btn-success {
                    background: #2ecc71;
                    border: none;
                }
                .modal-dark .btn-success:hover {
                    background: #27ae60;
                }
            `}</style>
        </div>
    );
};