import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../utils/api';

const ClientContext = createContext();

export const useClient = () => {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error('useClient must be used within a ClientProvider');
    }
    return context;
};

export const ClientProvider = ({ children }) => {
    const [client, setClient] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Verify token validity on mount
    useEffect(() => {
        verifyClientToken();
    }, []);

    const verifyClientToken = async () => {
        try {
            const token = localStorage.getItem('client_token');
            if (!token) {
                setIsAuthenticated(false);
                setClient(null);
                setIsLoading(false);
                return;
            }

            const response = await fetch(getApiUrl('/api/client/profile'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            if (data.success && data.client) {
                setClient(data.client);
                setIsAuthenticated(true);
            } else {
                logout();
            }
        } catch (error) {
            console.error('Client token verification failed:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await fetch(getApiUrl('/api/client/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success && data.token) {
                localStorage.setItem('client_token', data.token);
                setClient(data.client);
                setIsAuthenticated(true);
                return { success: true };
            }

            return { success: false, error: data.error || 'Login failed' };
        } catch (error) {
            console.error('Client login error:', error);
            return { success: false, error: 'Connection error' };
        }
    };

    const register = async (name, email, password, companyId, phone) => {
        try {
            const response = await fetch(getApiUrl('/api/client/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, companyId, phone })
            });

            const data = await response.json();

            if (data.success) {
                if (data.token) {
                    localStorage.setItem('client_token', data.token);
                    setClient(data.client);
                    setIsAuthenticated(true);
                }
                return { 
                    success: true, 
                    isPending: data.isPending, 
                    message: data.message || 'Registration successful! Pending administrator approval.' 
                };
            }

            return { success: false, error: data.error || 'Registration failed' };
        } catch (error) {
            console.error('Client registration error:', error);
            return { success: false, error: 'Connection error' };
        }
    };

    const logout = useCallback(() => {
        localStorage.removeItem('client_token');
        setClient(null);
        setIsAuthenticated(false);
    }, []);

    const value = {
        client,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        verifyClientToken
    };

    return (
        <ClientContext.Provider value={value}>
            {!isLoading && children}
        </ClientContext.Provider>
    );
};

export default ClientContext;
