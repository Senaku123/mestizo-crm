import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Opportunity, PaginatedResponse, OpportunityStage } from '../types';

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
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        fetchOpportunities();
    }, []);

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
                <div>
                    <span style={{ color: '#6c757d', marginRight: '1rem' }}>
                        {opportunities.length} oportunidades
                    </span>
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
        </div>
    );
}
