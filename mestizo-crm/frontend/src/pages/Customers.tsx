import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Customer, PaginatedResponse } from '../types';

export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        type: 'INDIVIDUAL',
        phone: '',
        email: '',
        notes: ''
    });

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (typeFilter) params.type = typeFilter;

            const data = await api.get<PaginatedResponse<Customer>>('/customers/', params);
            setCustomers(data.results || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [search, typeFilter]);

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/customers/', newCustomer);
            setShowModal(false);
            setNewCustomer({ name: '', type: 'INDIVIDUAL', phone: '', email: '', notes: '' });
            fetchCustomers();
        } catch (error) {
            console.error('Error creating customer:', error);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>👥 Clientes</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    ➕ Nuevo Cliente
                </button>
            </div>

            {/* Search and Filters */}
            <div className="search-bar">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select
                    className="form-control"
                    style={{ maxWidth: '200px' }}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="">Todos los tipos</option>
                    <option value="INDIVIDUAL">Persona</option>
                    <option value="COMPANY">Empresa</option>
                </select>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            ) : customers.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="icon">👥</div>
                        <h3>No hay clientes</h3>
                        <p>Comienza agregando tu primer cliente</p>
                    </div>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Tipo</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Contactos</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>
                                        <Link to={`/customers/${customer.id}`} style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                                            {customer.name}
                                        </Link>
                                    </td>
                                    <td>
                                        <span className={`badge ${customer.type === 'COMPANY' ? 'badge-quote' : 'badge-new'}`}>
                                            {customer.type === 'COMPANY' ? 'Empresa' : 'Persona'}
                                        </span>
                                    </td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.contacts_count || 0}</td>
                                    <td>
                                        <Link to={`/customers/${customer.id}`} className="btn btn-secondary btn-sm">
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
                            <h2>Nuevo Cliente</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateCustomer}>
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Tipo</label>
                                <select
                                    className="form-control"
                                    value={newCustomer.type}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, type: e.target.value })}
                                >
                                    <option value="INDIVIDUAL">Persona</option>
                                    <option value="COMPANY">Empresa</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Notas</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={newCustomer.notes}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Crear Cliente
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
