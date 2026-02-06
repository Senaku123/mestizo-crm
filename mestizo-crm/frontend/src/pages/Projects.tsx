import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Project, PaginatedResponse, Customer, Quote } from '../types';

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({
        customer: '',
        quote: '',
        title: '',
        status: 'PLANNING',
        description: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params: Record<string, string> = {};
                if (statusFilter) params.status = statusFilter;

                const [projectsData, customersData, quotesData] = await Promise.all([
                    api.get<PaginatedResponse<Project>>('/projects/', params),
                    api.get<PaginatedResponse<Customer>>('/customers/'),
                    api.get<PaginatedResponse<Quote>>('/quotes/', { status: 'ACCEPTED' }),
                ]);
                setProjects(projectsData.results || []);
                setCustomers(customersData.results || []);
                setQuotes(quotesData.results || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [statusFilter]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: Record<string, unknown> = {
                customer: Number(newProject.customer),
                title: newProject.title,
                status: newProject.status,
                description: newProject.description
            };
            if (newProject.quote) {
                payload.quote = Number(newProject.quote);
            }
            await api.post('/projects/', payload);
            setShowModal(false);
            setNewProject({ customer: '', quote: '', title: '', status: 'PLANNING', description: '' });
            // Refresh
            const data = await api.get<PaginatedResponse<Project>>('/projects/');
            setProjects(data.results || []);
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { class: string; label: string }> = {
            'PLANNING': { class: 'badge-draft', label: 'Planificación' },
            'IN_PROGRESS': { class: 'badge-sent', label: 'En Progreso' },
            'DONE': { class: 'badge-accepted', label: 'Terminado' },
            'MAINTENANCE': { class: 'badge-quote', label: 'Mantenimiento' },
        };
        return <span className={`badge ${config[status]?.class}`}>{config[status]?.label}</span>;
    };

    if (isLoading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1>🏗️ Proyectos</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    ➕ Nuevo Proyecto
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
                    <option value="PLANNING">Planificación</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="DONE">Terminado</option>
                    <option value="MAINTENANCE">Mantenimiento</option>
                </select>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="icon">🏗️</div>
                        <h3>No hay proyectos</h3>
                        <p>Comienza creando un nuevo proyecto</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="card" style={{ height: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <h3 style={{ margin: 0, color: 'var(--color-text)' }}>{project.title}</h3>
                                    {getStatusBadge(project.status)}
                                </div>
                                <p style={{ color: 'var(--color-text-light)', margin: '0.5rem 0' }}>
                                    👤 {project.customer_name}
                                </p>
                                {project.description && (
                                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.875rem', margin: '0.5rem 0' }}>
                                        {project.description.substring(0, 100)}...
                                    </p>
                                )}
                                <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
                                    <span>📷 {project.media_count || 0} fotos</span>
                                    {project.start_date && <span>Inicio: {new Date(project.start_date).toLocaleDateString('es-AR')}</span>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Nuevo Proyecto</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateProject}>
                            <div className="form-group">
                                <label>Título *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Cliente *</label>
                                <select
                                    className="form-control"
                                    value={newProject.customer}
                                    onChange={(e) => setNewProject({ ...newProject, customer: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar cliente...</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Estado</label>
                                <select
                                    className="form-control"
                                    value={newProject.status}
                                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                                >
                                    <option value="PLANNING">Planificación</option>
                                    <option value="IN_PROGRESS">En Progreso</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Cotización (opcional)</label>
                                <select
                                    className="form-control"
                                    value={newProject.quote}
                                    onChange={(e) => setNewProject({ ...newProject, quote: e.target.value })}
                                >
                                    <option value="">Sin cotización vinculada</option>
                                    {quotes.map(q => (
                                        <option key={q.id} value={q.id}>COT-{String(q.id).padStart(4, '0')} - {q.customer_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Crear Proyecto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
