import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Opportunity, Project, PaginatedResponse } from '../types';

type TabType = 'sales' | 'projects';

export default function History() {
    const [activeTab, setActiveTab] = useState<TabType>('sales');
    const [wonOpportunities, setWonOpportunities] = useState<Opportunity[]>([]);
    const [lostOpportunities, setLostOpportunities] = useState<Opportunity[]>([]);
    const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [oppsData, projectsData] = await Promise.all([
                    api.get<PaginatedResponse<Opportunity>>('/opportunities/'),
                    api.get<PaginatedResponse<Project>>('/projects/'),
                ]);

                const opps = oppsData.results || [];
                setWonOpportunities(opps.filter(o => o.stage === 'WON'));
                setLostOpportunities(opps.filter(o => o.stage === 'LOST'));

                const projects = projectsData.results || [];
                setCompletedProjects(projects.filter(p => p.status === 'DONE'));
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    const totalWonValue = wonOpportunities.reduce((sum, o) => sum + Number(o.value_estimate), 0);
    const totalLostValue = lostOpportunities.reduce((sum, o) => sum + Number(o.value_estimate), 0);

    return (
        <div>
            <div className="page-header">
                <h1>📚 Historial</h1>
                <p style={{ color: '#6c757d' }}>Ventas cerradas y proyectos completados</p>
            </div>

            {/* Stats Summary */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div className="stat-content">
                        <h3>{wonOpportunities.length}</h3>
                        <p>Ventas Ganadas</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red">❌</div>
                    <div className="stat-content">
                        <h3>{lostOpportunities.length}</h3>
                        <p>Ventas Perdidas</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">🏆</div>
                    <div className="stat-content">
                        <h3>{completedProjects.length}</h3>
                        <p>Proyectos Completados</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">💰</div>
                    <div className="stat-content">
                        <h3>{formatCurrency(totalWonValue)}</h3>
                        <p>Total Ganado</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button
                    className={`btn ${activeTab === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('sales')}
                >
                    💼 Ventas
                </button>
                <button
                    className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('projects')}
                >
                    🏗️ Proyectos
                </button>
            </div>

            {/* Sales Tab Content */}
            {activeTab === 'sales' && (
                <div>
                    {/* Won Sales */}
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <div className="card-header">
                            <h2>✅ Ventas Ganadas</h2>
                            <span className="badge badge-success">{formatCurrency(totalWonValue)}</span>
                        </div>
                        {wonOpportunities.length === 0 ? (
                            <div className="empty-state">
                                <p>No hay ventas ganadas aún</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Título</th>
                                            <th>Cliente</th>
                                            <th>Valor</th>
                                            <th>Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wonOpportunities.map(opp => (
                                            <tr key={opp.id}>
                                                <td><strong>{opp.title}</strong></td>
                                                <td>{opp.customer_name}</td>
                                                <td style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                                                    {formatCurrency(Number(opp.value_estimate))}
                                                </td>
                                                <td>{formatDate(opp.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Lost Sales */}
                    <div className="card">
                        <div className="card-header">
                            <h2>❌ Ventas Perdidas</h2>
                            <span className="badge" style={{ background: '#c62828', color: 'white' }}>
                                {formatCurrency(totalLostValue)}
                            </span>
                        </div>
                        {lostOpportunities.length === 0 ? (
                            <div className="empty-state">
                                <p>No hay ventas perdidas</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Título</th>
                                            <th>Cliente</th>
                                            <th>Valor</th>
                                            <th>Fecha</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lostOpportunities.map(opp => (
                                            <tr key={opp.id}>
                                                <td><strong>{opp.title}</strong></td>
                                                <td>{opp.customer_name}</td>
                                                <td style={{ color: '#c62828' }}>
                                                    {formatCurrency(Number(opp.value_estimate))}
                                                </td>
                                                <td>{formatDate(opp.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Projects Tab Content */}
            {activeTab === 'projects' && (
                <div className="card">
                    <div className="card-header">
                        <h2>🏆 Proyectos Completados</h2>
                        <span className="badge badge-success">{completedProjects.length} proyectos</span>
                    </div>
                    {completedProjects.length === 0 ? (
                        <div className="empty-state">
                            <p>No hay proyectos completados aún</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Proyecto</th>
                                        <th>Cliente</th>
                                        <th>Descripción</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {completedProjects.map(project => (
                                        <tr key={project.id}>
                                            <td><strong>{project.title}</strong></td>
                                            <td>{project.customer_name}</td>
                                            <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {project.description || '-'}
                                            </td>
                                            <td>
                                                <Link to={`/projects/${project.id}`} className="btn btn-sm btn-secondary">
                                                    Ver
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
