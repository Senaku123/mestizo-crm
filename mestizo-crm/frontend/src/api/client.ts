import axios, { AxiosInstance, AxiosError } from 'axios';
import { TokenResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor - add token
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('access_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - handle 401
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && originalRequest) {
                    const refreshToken = localStorage.getItem('refresh_token');

                    if (refreshToken) {
                        try {
                            const response = await axios.post<TokenResponse>(`${API_URL}/token/refresh/`, {
                                refresh: refreshToken,
                            });

                            localStorage.setItem('access_token', response.data.access);
                            if (response.data.refresh) {
                                localStorage.setItem('refresh_token', response.data.refresh);
                            }

                            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                            return this.client(originalRequest);
                        } catch {
                            // Refresh failed, clear tokens
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            window.location.href = '/login';
                        }
                    } else {
                        window.location.href = '/login';
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    // Auth
    async login(email: string, password: string): Promise<TokenResponse> {
        const response = await this.client.post<TokenResponse>('/token/', { email, password });
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        return response.data;
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    }

    // Generic CRUD methods
    async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
        const response = await this.client.get<T>(url, { params });
        return response.data;
    }

    async post<T>(url: string, data?: unknown): Promise<T> {
        const response = await this.client.post<T>(url, data);
        return response.data;
    }

    async put<T>(url: string, data: unknown): Promise<T> {
        const response = await this.client.put<T>(url, data);
        return response.data;
    }

    async patch<T>(url: string, data: unknown): Promise<T> {
        const response = await this.client.patch<T>(url, data);
        return response.data;
    }

    async delete(url: string): Promise<void> {
        await this.client.delete(url);
    }

    // File upload
    async uploadFile<T>(url: string, file: File): Promise<T> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await this.client.post<T>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
}

export const api = new ApiClient();
export default api;
