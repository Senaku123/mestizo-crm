import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { DashboardStats, PaginatedResponse, Activity } from '../types';

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, activitiesData] = await Promise.all([
                    api.get<DashboardStats>('/dashboard/stats/'),
                    api.get<PaginatedResponse<Activity>>('/activities/', { limit: 5 }),
                ]);
                setStats(statsData);
                setActivities(activitiesData.results || []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div>
            <div className="page-header">
                <h1>📊 Dashboard</h1>
                <p style={{ color: '#6c757d' }}>Resumen general del CRM</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon green">🌱</div>
                    <div className="stat-content">
                        <h3>{stats?.leads.new || 0}</h3>
                        <p>Leads nuevos</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon blue">🎯</div>
                    <div className="stat-content">
                        <h3>{Object.values(stats?.opportunities_by_stage || {}).reduce((a, b) => a + b, 0)}</h3>
                        <p>Oportunidades activas</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon orange">📋</div>
                    <div className="stat-content">
                        <h3>{(stats?.quotes.draft || 0) + (stats?.quotes.sent || 0)}</h3>
                        <p>Cotizaciones pendientes</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon purple">💰</div>
                    <div className="stat-content">
                        <h3>{formatCurrency(stats?.total_pipeline_value || 0)}</h3>
                        <p>Valor de ventas</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Pipeline Overview */}
                <div className="card">
                    <div className="card-header">
                        <h2>Ventas por etapa</h2>
                        <Link to="/pipeline" className="btn btn-secondary btn-sm">Ver todo</Link>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            { key: 'NEW', label: 'Nuevos', color: '#1976d2' },
                            { key: 'CONTACTED', label: 'Contactados', color: '#f57c00' },
                            { key: 'VISIT_SCHEDULED', label: 'Visita Agendada', color: '#7b1fa2' },
                            { key: 'QUOTE_SENT', label: 'Cotización Enviada', color: '#388e3c' },
                            { key: 'NEGOTIATION', label: 'En Negociación', color: '#c2185b' },
                        ].map(({ key, label, color }) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    background: color
                                }}></div>
                                <span style={{ flex: 1 }}>{label}</span>
                                <strong>{stats?.opportunities_by_stage[key as keyof typeof stats.opportunities_by_stage] || 0}</strong>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="card">
                    <div className="card-header">
                        <h2>Actividades pendientes</h2>
                        <span className="badge badge-new">{stats?.activities_pending || 0} pendientes</span>
                    </div>
                    {activities.length === 0 ? (
                        <div className="empty-state">
                            <p>No hay actividades pendientes</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {activities.slice(0, 5).map((activity) => (
                                <div
                                    key={activity.id}
                                    style={{
                                        padding: '0.75rem',
                                        background: '#f8f9fa',
                                        borderRadius: '8px',
                                        borderLeft: `3px solid ${activity.is_done ? '#28a745' : '#ffc107'}`
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <strong>{activity.type_display}</strong>
                                        <small style={{ color: '#6c757d' }}>
                                            {activity.due_at ? new Date(activity.due_at).toLocaleDateString('es-AR') : ''}
                                        </small>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#6c757d', margin: 0 }}>
                                        {activity.notes?.substring(0, 50)}...
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Acciones rápidas</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link to="/customers" className="btn btn-primary">
                        ➕ Nuevo Cliente
                    </Link>
                    <Link to="/pipeline" className="btn btn-secondary">
                        🎯 Ver Ventas
                    </Link>
                    <Link to="/quotes" className="btn btn-secondary">
                        📋 Nueva Cotización
                    </Link>
                    <Link to="/import" className="btn btn-secondary">
                        📥 Importar Datos
                    </Link>
                </div>
            </div>
        </div>
    );
}
