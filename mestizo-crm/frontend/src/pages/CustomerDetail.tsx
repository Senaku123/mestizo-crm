import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Customer, Contact, Address } from '../types';

export default function CustomerDetail() {
    const { id } = useParams<{ id: string }>();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', role_title: '' });
    const [newAddress, setNewAddress] = useState({ label: 'Principal', city: '', zone: '', details: '' });

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const data = await api.get<Customer>(`/customers/${id}/`);
                setCustomer(data);
            } catch (error) {
                console.error('Error fetching customer:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchCustomer();
    }, [id]);

    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const contact = await api.post<Contact>('/contacts/', { ...newContact, customer: Number(id) });
            setCustomer(prev => prev ? { ...prev, contacts: [...(prev.contacts || []), contact] } : null);
            setShowContactModal(false);
            setNewContact({ name: '', phone: '', email: '', role_title: '' });
        } catch (error) {
            console.error('Error adding contact:', error);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const address = await api.post<Address>('/addresses/', { ...newAddress, customer: Number(id) });
            setCustomer(prev => prev ? { ...prev, addresses: [...(prev.addresses || []), address] } : null);
            setShowAddressModal(false);
            setNewAddress({ label: 'Principal', city: '', zone: '', details: '' });
        } catch (error) {
            console.error('Error adding address:', error);
        }
    };

    if (isLoading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    if (!customer) {
        return <div className="empty-state"><h3>Cliente no encontrado</h3></div>;
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <Link to="/customers" style={{ color: 'var(--color-text-light)', textDecoration: 'none' }}>
                        ← Volver a clientes
                    </Link>
                    <h1 style={{ marginTop: '0.5rem' }}>👤 {customer.name}</h1>
                </div>
                <span className={`badge ${customer.type === 'COMPANY' ? 'badge-quote' : 'badge-new'}`}>
                    {customer.type === 'COMPANY' ? 'Empresa' : 'Persona'}
                </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Customer Info */}
                <div className="card">
                    <h2 style={{ marginBottom: '1rem' }}>Información</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div><strong>Email:</strong> {customer.email || '-'}</div>
                        <div><strong>Teléfono:</strong> {customer.phone || '-'}</div>
                        <div><strong>Notas:</strong> {customer.notes || '-'}</div>
                        <div><strong>Creado:</strong> {new Date(customer.created_at).toLocaleDateString('es-AR')}</div>
                    </div>
                </div>

                {/* Contacts */}
                <div className="card">
                    <div className="card-header">
                        <h2>Contactos</h2>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowContactModal(true)}>
                            ➕ Agregar
                        </button>
                    </div>
                    {customer.contacts?.length === 0 ? (
                        <p style={{ color: 'var(--color-text-light)' }}>Sin contactos registrados</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {customer.contacts?.map((contact) => (
                                <div key={contact.id} style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                    <strong>{contact.name}</strong>
                                    {contact.role_title && <span style={{ color: '#6c757d' }}> - {contact.role_title}</span>}
                                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.25rem' }}>
                                        {contact.phone && <span>📞 {contact.phone}</span>}
                                        {contact.email && <span style={{ marginLeft: '1rem' }}>📧 {contact.email}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Addresses */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                        <h2>Direcciones</h2>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowAddressModal(true)}>
                            ➕ Agregar
                        </button>
                    </div>
                    {customer.addresses?.length === 0 ? (
                        <p style={{ color: 'var(--color-text-light)' }}>Sin direcciones registradas</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                            {customer.addresses?.map((address) => (
                                <div key={address.id} style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                    <strong>{address.label}</strong>
                                    <div style={{ fontSize: '0.875rem', color: '#6c757d', marginTop: '0.25rem' }}>
                                        <div>📍 {address.city} - {address.zone}</div>
                                        {address.details && <div style={{ marginTop: '0.25rem' }}>{address.details}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Contact Modal */}
            {showContactModal && (
                <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Agregar Contacto</h2>
                            <button className="modal-close" onClick={() => setShowContactModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAddContact}>
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input type="text" className="form-control" value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Cargo</label>
                                <input type="text" className="form-control" value={newContact.role_title}
                                    onChange={(e) => setNewContact({ ...newContact, role_title: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Teléfono</label>
                                <input type="tel" className="form-control" value={newContact.phone}
                                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" className="form-control" value={newContact.email}
                                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowContactModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Address Modal */}
            {showAddressModal && (
                <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Agregar Dirección</h2>
                            <button className="modal-close" onClick={() => setShowAddressModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAddAddress}>
                            <div className="form-group">
                                <label>Etiqueta</label>
                                <input type="text" className="form-control" value={newAddress.label}
                                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Ciudad</label>
                                <input type="text" className="form-control" value={newAddress.city}
                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Zona/Barrio</label>
                                <input type="text" className="form-control" value={newAddress.zone}
                                    onChange={(e) => setNewAddress({ ...newAddress, zone: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Detalles</label>
                                <textarea className="form-control" rows={2} value={newAddress.details}
                                    onChange={(e) => setNewAddress({ ...newAddress, details: e.target.value })}></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddressModal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
