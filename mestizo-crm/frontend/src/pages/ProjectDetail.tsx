import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Project, ProjectMedia } from '../types';

export default function ProjectDetail() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [newMedia, setNewMedia] = useState({ media_type: 'PROGRESS', url: '', caption: '' });

    const fetchProject = async () => {
        try {
            const data = await api.get<Project>(`/projects/${id}/`);
            setProject(data);
        } catch (error) {
            console.error('Error fetching project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchProject();
    }, [id]);

    const handleAddMedia = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/project-media/', { ...newMedia, project: Number(id) });
            setShowMediaModal(false);
            setNewMedia({ media_type: 'PROGRESS', url: '', caption: '' });
            fetchProject();
        } catch (error) {
            console.error('Error adding media:', error);
        }
    };

    const handleDeleteMedia = async (mediaId: number) => {
        if (!confirm('¿Eliminar esta imagen?')) return;
        try {
            await api.delete(`/project-media/${mediaId}/`);
            fetchProject();
        } catch (error) {
            console.error('Error deleting media:', error);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            await api.patch(`/projects/${id}/`, { status: newStatus });
            fetchProject();
        } catch (error) {
            console.error('Error changing status:', error);
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

    const groupMediaByType = (media: ProjectMedia[]) => {
        return {
            BEFORE: media.filter(m => m.media_type === 'BEFORE'),
            PROGRESS: media.filter(m => m.media_type === 'PROGRESS'),
            AFTER: media.filter(m => m.media_type === 'AFTER'),
        };
    };

    if (isLoading) {
        return <div className="loading-container"><div className="spinner"></div></div>;
    }

    if (!project) {
        return <div className="empty-state"><h3>Proyecto no encontrado</h3></div>;
    }

    const groupedMedia = groupMediaByType(project.media || []);

    return (
        <div>
            <div className="page-header">
                <div>
                    <Link to="/projects" style={{ color: 'var(--color-text-light)', textDecoration: 'none' }}>
                        ← Volver a proyectos
                    </Link>
                    <h1 style={{ marginTop: '0.5rem' }}>🏗️ {project.title}</h1>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {getStatusBadge(project.status)}
                    <select
                        className="form-control"
                        style={{ width: 'auto' }}
                        value={project.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                    >
                        <option value="PLANNING">Planificación</option>
                        <option value="IN_PROGRESS">En Progreso</option>
                        <option value="DONE">Terminado</option>
                        <option value="MAINTENANCE">Mantenimiento</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
                {/* Media Gallery */}
                <div>
                    <div className="card">
                        <div className="card-header">
                            <h2>📷 Galería de Imágenes</h2>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowMediaModal(true)}>
                                ➕ Agregar Imagen
                            </button>
                        </div>

                        {/* Before */}
                        {groupedMedia.BEFORE.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-text-light)' }}>📸 Antes</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {groupedMedia.BEFORE.map(media => (
                                        <div key={media.id} style={{ position: 'relative' }}>
                                            <img
                                                src={media.url}
                                                alt={media.caption || 'Antes'}
                                                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Error'; }}
                                            />
                                            <button
                                                onClick={() => handleDeleteMedia(media.id)}
                                                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                                            >
                                                🗑️
                                            </button>
                                            {media.caption && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{media.caption}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Progress */}
                        {groupedMedia.PROGRESS.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-text-light)' }}>🔄 Progreso</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {groupedMedia.PROGRESS.map(media => (
                                        <div key={media.id} style={{ position: 'relative' }}>
                                            <img
                                                src={media.url}
                                                alt={media.caption || 'Progreso'}
                                                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Error'; }}
                                            />
                                            <button
                                                onClick={() => handleDeleteMedia(media.id)}
                                                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                                            >
                                                🗑️
                                            </button>
                                            {media.caption && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{media.caption}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* After */}
                        {groupedMedia.AFTER.length > 0 && (
                            <div>
                                <h4 style={{ marginBottom: '0.75rem', color: 'var(--color-text-light)' }}>✅ Después</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {groupedMedia.AFTER.map(media => (
                                        <div key={media.id} style={{ position: 'relative' }}>
                                            <img
                                                src={media.url}
                                                alt={media.caption || 'Después'}
                                                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=Error'; }}
                                            />
                                            <button
                                                onClick={() => handleDeleteMedia(media.id)}
                                                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
                                            >
                                                🗑️
                                            </button>
                                            {media.caption && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{media.caption}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(project.media?.length || 0) === 0 && (
                            <div className="empty-state">
                                <p>Sin imágenes. Agrega fotos del antes, después o progreso.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Project Info Sidebar */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Información</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                            <strong>Cliente:</strong>
                            <div>{project.customer_name}</div>
                        </div>
                        {project.quote_number && (
                            <div>
                                <strong>Cotización:</strong>
                                <div>{project.quote_number}</div>
                            </div>
                        )}
                        <div>
                            <strong>Fecha de inicio:</strong>
                            <div>{project.start_date ? new Date(project.start_date).toLocaleDateString('es-AR') : '-'}</div>
                        </div>
                        <div>
                            <strong>Fecha de fin:</strong>
                            <div>{project.end_date ? new Date(project.end_date).toLocaleDateString('es-AR') : '-'}</div>
                        </div>
                        {project.description && (
                            <div>
                                <strong>Descripción:</strong>
                                <div style={{ color: 'var(--color-text-light)' }}>{project.description}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Media Modal */}
            {showMediaModal && (
                <div className="modal-overlay" onClick={() => setShowMediaModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Agregar Imagen</h2>
                            <button className="modal-close" onClick={() => setShowMediaModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleAddMedia}>
                            <div className="form-group">
                                <label>Tipo</label>
                                <select
                                    className="form-control"
                                    value={newMedia.media_type}
                                    onChange={(e) => setNewMedia({ ...newMedia, media_type: e.target.value })}
                                >
                                    <option value="BEFORE">Antes</option>
                                    <option value="PROGRESS">Progreso</option>
                                    <option value="AFTER">Después</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>URL de la imagen *</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    value={newMedia.url}
                                    onChange={(e) => setNewMedia({ ...newMedia, url: e.target.value })}
                                    placeholder="https://..."
                                    required
                                />
                                <small style={{ color: 'var(--color-text-light)' }}>
                                    Ingresa la URL de una imagen (puedes usar Imgur, Google Drive, etc.)
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Descripción</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newMedia.caption}
                                    onChange={(e) => setNewMedia({ ...newMedia, caption: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowMediaModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Agregar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
