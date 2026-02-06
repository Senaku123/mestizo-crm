import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Opportunity, PaginatedResponse, OpportunityStage, Customer } from '../types';

const STAGES: { key: OpportunityStage; label: string; color: string }[] = [
    { key: 'NEW', label: 'Nuevos', color: '#1976d2' },
    { key: 'CONTACTED', label: 'Contactados', color: '#f57c00' },
    { key: 'VISIT_SCHEDULED', label: 'Visita Agendada', color: '#7b1fa2' },
    { key: 'QUOTE_SENT', label: 'Cotización Enviada', color: '#388e3c' },
    { key: 'NEGOTIATION', label: 'En Negociación', color: '#c2185b' },
    { key: 'WON', label: 'Ganados', color: '#2e7d32' },
    { key: 'LOST', label: 'Perdidos', color: '#c62828' },
];

export default function Pipeline() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newOpportunity, setNewOpportunity] = useState({
        customer: '',
        title: '',
        value_estimate: 0
    });

    const fetchOpportunities = async () => {
        try {
            const data = await api.get<PaginatedResponse<Opportunity>>('/opportunities/');
            setOpportunities(data.results || []);
        } catch (error) {
            console.error('Error fetching opportunities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const data = await api.get<PaginatedResponse<Customer>>('/customers/');
            setCustomers(data.results || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    useEffect(() => {
        fetchOpportunities();
        fetchCustomers();
    }, []);

    const handleCreateOpportunity = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/opportunities/', {
                customer: Number(newOpportunity.customer),
                title: newOpportunity.title,
                value_estimate: newOpportunity.value_estimate,
                stage: 'NEW'
            });
            setShowModal(false);
            setNewOpportunity({ customer: '', title: '', value_estimate: 0 });
            fetchOpportunities();
        } catch (error) {
            console.error('Error creating opportunity:', error);
        }
    };

    const handleStageChange = async (opportunityId: number, newStage: OpportunityStage) => {
        try {
            await api.post(`/opportunities/${opportunityId}/change_stage/`, { stage: newStage });
            setOpportunities(prev =>
                prev.map(opp =>
                    opp.id === opportunityId ? { ...opp, stage: newStage } : opp
                )
            );
        } catch (error) {
            console.error('Error changing stage:', error);
        }
    };

    const getOpportunitiesByStage = (stage: OpportunityStage) => {
        return opportunities.filter(opp => opp.stage === stage);
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

    return (
        <div>
            <div className="page-header">
                <h1>🎯 Seguimiento de Ventas</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#6c757d' }}>
                        {opportunities.length} oportunidades
                    </span>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        ➕ Nueva Oportunidad
                    </button>
                </div>
            </div>

            <div className="pipeline-board">
                {STAGES.map(stage => {
                    const stageOpps = getOpportunitiesByStage(stage.key);
                    const stageValue = stageOpps.reduce((sum, o) => sum + Number(o.value_estimate), 0);

                    return (
                        <div key={stage.key} className="pipeline-column">
                            <div className="pipeline-column-header">
                                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        background: stage.color
                                    }}></span>
                                    {stage.label}
                                </h4>
                                <span className="pipeline-count">{stageOpps.length}</span>
                            </div>

                            {stageValue > 0 && (
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6c757d',
                                    marginBottom: '0.75rem',
                                    textAlign: 'center'
                                }}>
                                    {formatCurrency(stageValue)}
                                </div>
                            )}

                            {stageOpps.map(opp => (
                                <div
                                    key={opp.id}
                                    className="pipeline-card"
                                    style={{ borderLeftColor: stage.color }}
                                >
                                    <h5>{opp.title}</h5>
                                    <p>{opp.customer_name}</p>
                                    <div className="value">{formatCurrency(Number(opp.value_estimate))}</div>

                                    {/* Stage change buttons */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.25rem',
                                        marginTop: '0.75rem',
                                        flexWrap: 'wrap'
                                    }}>
                                        {stage.key !== 'WON' && stage.key !== 'LOST' && (
                                            <>
                                                {STAGES.filter(s => s.key !== stage.key && s.key !== 'WON' && s.key !== 'LOST')
                                                    .slice(0, 2)
                                                    .map(s => (
                                                        <button
                                                            key={s.key}
                                                            className="btn btn-sm btn-secondary"
                                                            style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                                                            onClick={() => handleStageChange(opp.id, s.key)}
                                                        >
                                                            → {s.label.split(' ')[0]}
                                                        </button>
                                                    ))
                                                }
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                                                    onClick={() => handleStageChange(opp.id, 'WON')}
                                                >
                                                    ✓ Ganado
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}
                                                    onClick={() => handleStageChange(opp.id, 'LOST')}
                                                >
                                                    ✗ Perdido
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {stageOpps.length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    color: '#6c757d',
                                    padding: '2rem',
                                    fontSize: '0.875rem'
                                }}>
                                    Sin oportunidades
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Create Opportunity Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Nueva Oportunidad</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateOpportunity}>
                            <div className="form-group">
                                <label>Cliente *</label>
                                <select
                                    className="form-control"
                                    value={newOpportunity.customer}
                                    onChange={(e) => setNewOpportunity({ ...newOpportunity, customer: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar cliente...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Título *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newOpportunity.title}
                                    onChange={(e) => setNewOpportunity({ ...newOpportunity, title: e.target.value })}
                                    placeholder="Ej: Proyecto jardín casa norte"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Valor Estimado (ARS)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={newOpportunity.value_estimate}
                                    onChange={(e) => setNewOpportunity({ ...newOpportunity, value_estimate: Number(e.target.value) })}
                                    min="0"
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Crear Oportunidad
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
