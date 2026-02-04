import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Pipeline from './pages/Pipeline';
import Quotes from './pages/Quotes';
import QuoteDetail from './pages/QuoteDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ImportData from './pages/ImportData';
import History from './pages/History';

function PrivateRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="app-container">
            <Navbar />
            <main className="main-content">{children}</main>
        </div>
    );
}

function App() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/" /> : <Login />}
            />

            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <Dashboard />
                        </AppLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/customers"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <Customers />
                        </AppLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/customers/:id"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <CustomerDetail />
                        </AppLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/pipeline"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <Pipeline />
                        </AppLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/quotes"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <Quotes />
                        </AppLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/quotes/:id"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <QuoteDetail />
                        </AppLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/projects"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <Projects />
                        </AppLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/projects/:id"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <ProjectDetail />
                        </AppLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/import"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <ImportData />
                        </AppLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/history"
                element={
                    <PrivateRoute>
                        <AppLayout>
                            <History />
                        </AppLayout>
                    </PrivateRoute>
                }
            />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;
