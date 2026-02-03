import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api/client';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = !!user;

    useEffect(() => {
        // Check if already authenticated on mount
        const checkAuth = async () => {
            if (api.isAuthenticated()) {
                try {
                    // For now, we'll just mark as authenticated without fetching user details
                    // In a real app, you'd have a /me endpoint
                    setUser({
                        id: 1,
                        email: localStorage.getItem('user_email') || 'user@mestizo.com',
                        first_name: 'Usuario',
                        last_name: '',
                        role: 'SALES'
                    });
                } catch {
                    api.logout();
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setError(null);
        setIsLoading(true);

        try {
            await api.login(email, password);
            localStorage.setItem('user_email', email);
            setUser({
                id: 1,
                email,
                first_name: email.split('@')[0],
                last_name: '',
                role: 'SALES'
            });
        } catch (err: unknown) {
            const errorMessage = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
                || 'Error al iniciar sesión';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        api.logout();
        localStorage.removeItem('user_email');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
