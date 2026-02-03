import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Quote, QuoteItem, CatalogItem, PaginatedResponse } from '../types';

export default function QuoteDetail() {
    const { id } = useParams<{ id: string }>();
    const [quote, setQuote] = useState<Quote | null>(null);
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showItemModal, setShowItemModal] = useState(false);
    const [newItem, setNewItem] = useState<Partial<QuoteItem>>({
        item_type: 'PRODUCT',
        name: '',
        qty: 1,
        unit_price: 0
    });

    const fetchQuote = async () => {
        try {
            const [quoteData, catalogData] = await Promise.all([
                api.get<Quote>(`/quotes/${id}/`),
                api.get<PaginatedResponse<CatalogItem>>('/catalog/', { active: 'true' }),
            ]);
            setQuote(quoteData);
            setCatalog(catalogData.results || []);
        } catch (error) {
            console.error('Error fetching quote:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchQuote();
    }, [id]);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/quote-items/', { ...newItem, quote: Number(id) });
            setShowItemModal(false);
            setNewItem({ item_type: 'PRODUCT', name: '', qty: 1, unit_price: 0 });
            fetchQuote();
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const handleDeleteItem = async (itemId: number) => {
        if (!confirm('¿Eliminar este item?')) return;
        try {
            await api.delete(`/quote-items/${itemId}/`);
            fetchQuote();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await api.post(`/quotes/${id}/change_status/`, { status: newStatus });
            fetchQuote();
        } catch (error) {
            console.error('Error changing status:', error);
        }
    };

    const handleCatalogSelect = (catalogItem: CatalogItem) => {
        setNewItem({
            item_type: catalogItem.type,
            name: catalogItem.name,
            qty: 1,
            unit_price: Number(catalogItem.price_ref)
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (isLoading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    if (!quote) {
        return <div className="empty-state"><h3>Cotización no encontrada</h3></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <Link to="/quotes" style={{ color: 'var(--color-text-light)', textDecoration: 'none' }}>
                        ← Volver a cotizaciones
                    </Link>
                    <h1 style={{ marginTop: '0.5rem' }}>📋 COT-{String(quote.id).padStart(4, '0')}</h1>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {quote.status === 'DRAFT' && (
                        <button className="btn btn-primary" onClick={() => handleStatusChange('SENT')}>
                            📤 Marcar como Enviada
                        </button>
                    )}
                    {quote.status === 'SENT' && (
                        <>
                            <button className="btn btn-success" onClick={() => handleStatusChange('ACCEPTED')}>
                                ✓ Aceptada
                            </button>
                            <button className="btn btn-danger" onClick={() => handleStatusChange('REJECTED')}>
                                ✗ Rechazada
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Items Table */}
                <div className="card">
                    <div className="card-header">
                        <h2>Items de la Cotización</h2>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowItemModal(true)}>
                            ➕ Agregar Item
                        </button>
                    </div>

                    {quote.items?.length === 0 ? (
                        <div className="empty-state">
                            <p>No hay items. Agrega productos o servicios.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Descripción</th>
                                    <th style={{ textAlign: 'right' }}>Cant.</th>
                                    <th style={{ textAlign: 'right' }}>P. Unit.</th>
                                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {quote.items?.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <span className={`badge ${item.item_type === 'PRODUCT' ? 'badge-new' : 'badge-quote'}`}>
                                                {item.item_type === 'PRODUCT' ? 'Producto' : 'Servicio'}
                                            </span>
                                        </td>
                                        <td>{item.name}</td>
                                        <td style={{ textAlign: 'right' }}>{item.qty}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(Number(item.unit_price))}</td>
                                        <td style={{ textAlign: 'right' }}><strong>{formatCurrency(Number(item.line_total))}</strong></td>
                                        <td>
                                            <button
                                                className="btn btn-sm"
                                                style={{ color: 'var(--color-danger)', background: 'none' }}
                                                onClick={() => item.id && handleDeleteItem(item.id)}
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600 }}>TOTAL</td>
                                    <td style={{ textAlign: 'right', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                        {formatCurrency(Number(quote.total))}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>

                {/* Quote Info */}
                <div className="card">
                    <h2 style={{ marginBottom: '1rem' }}>Información</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <strong>Cliente:</strong>
                            <div>{quote.customer_name}</div>
                        </div>
                        <div>
                            <strong>Estado:</strong>
                            <div style={{ marginTop: '0.25rem' }}>
                                <span className={`badge badge-${quote.status.toLowerCase()}`}>
                                    {quote.status_display}
                                </span>
                            </div>
                        </div>
                        <div>
                            <strong>Válida hasta:</strong>
                            <div>{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('es-AR') : '-'}</div>
                        </div>
                        <div>
                            <strong>Creada:</strong>
                            <div>{new Date(quote.created_at).toLocaleDateString('es-AR')}</div>
                        </div>
                        {quote.notes && (
                            <div>
                                <strong>Notas:</strong>
                                <div style={{ color: 'var(--color-text-light)' }}>{quote.notes}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Item Modal */}
            {showItemModal && (
                <div className="modal-overlay" onClick={() => setShowItemModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Agregar Item</h2>
                            <button className="modal-close" onClick={() => setShowItemModal(false)}>&times;</button>
                        </div>

                        {/* Catalog Quick Select */}
                        {catalog.length > 0 && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                                    Seleccionar del catálogo:
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto' }}>
                                    {catalog.slice(0, 10).map(item => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleCatalogSelect(item)}
                                        >
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleAddItem}>
                            <div className="form-group">
                                <label>Tipo</label>
                                <select
                                    className="form-control"
                                    value={newItem.item_type}
                                    onChange={(e) => setNewItem({ ...newItem, item_type: e.target.value as 'PRODUCT' | 'SERVICE' })}
                                >
                                    <option value="PRODUCT">Producto</option>
                                    <option value="SERVICE">Servicio</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Descripción *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Cantidad *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={newItem.qty}
                                        onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                                        min="0.01"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Precio Unitario *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={newItem.unit_price}
                                        onChange={(e) => setNewItem({ ...newItem, unit_price: Number(e.target.value) })}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowItemModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Agregar Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
