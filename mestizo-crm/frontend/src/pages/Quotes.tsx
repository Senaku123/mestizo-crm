import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Quote, PaginatedResponse, Customer, Opportunity } from '../types';

export default function Quotes() {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newQuote, setNewQuote] = useState({ customer: '', opportunity: '', notes: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params: Record<string, string> = {};
                if (statusFilter) params.status = statusFilter;

                const [quotesData, customersData, opportunitiesData] = await Promise.all([
                    api.get<PaginatedResponse<Quote>>('/quotes/', params),
                    api.get<PaginatedResponse<Customer>>('/customers/'),
                    api.get<PaginatedResponse<Opportunity>>('/opportunities/'),
                ]);
                setQuotes(quotesData.results || []);
                setCustomers(customersData.results || []);
                setOpportunities(opportunitiesData.results || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [statusFilter]);

    const handleCreateQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: Record<string, unknown> = {
                customer: Number(newQuote.customer),
                notes: newQuote.notes,
                status: 'DRAFT'
            };
            if (newQuote.opportunity) {
                payload.opportunity = Number(newQuote.opportunity);
            }
            const quote = await api.post<Quote>('/quotes/', payload);
            setShowModal(false);
            setNewQuote({ customer: '', opportunity: '', notes: '' });
            // Navigate to the new quote
            window.location.href = `/quotes/${quote.id}`;
        } catch (error) {
            console.error('Error creating quote:', error);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const getStatusBadge = (status: string) => {
        const classes: Record<string, string> = {
            'DRAFT': 'badge-draft',
            'SENT': 'badge-sent',
            'ACCEPTED': 'badge-accepted',
            'REJECTED': 'badge-rejected',
        };
        const labels: Record<string, string> = {
            'DRAFT': 'Borrador',
            'SENT': 'Enviada',
            'ACCEPTED': 'Aceptada',
            'REJECTED': 'Rechazada',
        };
        return <span className={`badge ${classes[status]}`}>{labels[status]}</span>;
    };

    if (isLoading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1>📋 Cotizaciones</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    ➕ Nueva Cotización
                </button>
            </div>

            {/* Filters */}
            <div className="search-bar">
                <select
                    className="form-control"
                    style={{ maxWidth: '200px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Todos los estados</option>
                    <option value="DRAFT">Borrador</option>
                    <option value="SENT">Enviada</option>
                    <option value="ACCEPTED">Aceptada</option>
                    <option value="REJECTED">Rechazada</option>
                </select>
            </div>

            {/* Table */}
            {quotes.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="icon">📋</div>
                        <h3>No hay cotizaciones</h3>
                        <p>Comienza creando una nueva cotización</p>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Cliente</th>
                                <th>Estado</th>
                                <th>Total</th>
                                <th>Items</th>
                                <th>Válida hasta</th>
                                <th>Creada</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quotes.map((quote) => (
                                <tr key={quote.id}>
                                    <td>
                                        <Link to={`/quotes/${quote.id}`} style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                                            COT-{String(quote.id).padStart(4, '0')}
                                        </Link>
                                    </td>
                                    <td>{quote.customer_name}</td>
                                    <td>{getStatusBadge(quote.status)}</td>
                                    <td><strong>{formatCurrency(Number(quote.total))}</strong></td>
                                    <td>{quote.items_count || 0}</td>
                                    <td>{quote.valid_until ? new Date(quote.valid_until).toLocaleDateString('es-AR') : '-'}</td>
                                    <td>{new Date(quote.created_at).toLocaleDateString('es-AR')}</td>
                                    <td>
                                        <Link to={`/quotes/${quote.id}`} className="btn btn-secondary btn-sm">
                                            Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Nueva Cotización</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateQuote}>
                            <div className="form-group">
                                <label>Cliente *</label>
                                <select
                                    className="form-control"
                                    value={newQuote.customer}
                                    onChange={(e) => setNewQuote({ ...newQuote, customer: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar cliente...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Oportunidad (opcional)</label>
                                <select
                                    className="form-control"
                                    value={newQuote.opportunity}
                                    onChange={(e) => setNewQuote({ ...newQuote, opportunity: e.target.value })}
                                >
                                    <option value="">Sin oportunidad vinculada</option>
                                    {opportunities
                                        .filter(opp => !newQuote.customer || opp.customer === Number(newQuote.customer))
                                        .map(opp => (
                                            <option key={opp.id} value={opp.id}>{opp.title} ({opp.customer_name})</option>
                                        ))
                                    }
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Notas</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={newQuote.notes}
                                    onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Crear y Agregar Items
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
