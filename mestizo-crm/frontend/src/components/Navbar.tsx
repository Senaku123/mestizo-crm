import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <span>🌿</span>
                <h1>Mestizo</h1>
            </div>

            <ul className="nav-links">
                <li>
                    <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="icon">📊</span>
                        Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/customers" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="icon">👥</span>
                        Clientes
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/pipeline" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="icon">🎯</span>
                        Seguimiento de Ventas
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/quotes" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="icon">📋</span>
                        Cotizaciones
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/projects" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="icon">🏗️</span>
                        Proyectos
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/history" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="icon">📚</span>
                        Historial
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/import" className={({ isActive }) => isActive ? 'active' : ''}>
                        <span className="icon">📥</span>
                        Importar CSV
                    </NavLink>
                </li>
            </ul>

            <div className="navbar-footer">
                <div className="user-info">
                    <div className="user-avatar">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <strong>{user?.first_name || 'Usuario'}</strong>
                        <br />
                        <small style={{ opacity: 0.7 }}>{user?.email}</small>
                    </div>
                </div>
                <button className="logout-btn" onClick={logout}>
                    Cerrar sesión
                </button>
            </div>
        </nav>
    );
}
