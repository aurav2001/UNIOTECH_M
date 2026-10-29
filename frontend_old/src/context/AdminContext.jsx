import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../utils/api';

const AdminContext = createContext();

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [userRole, setUserRole] = useState(null); // 'admin' or 'blog_editor'
    const [permissions, setPermissions] = useState([]);
    const timeoutRef = useRef(null);

    // Check token validity on mount
    useEffect(() => {
        verifyToken();
    }, []);

    // Session timeout - auto logout after inactivity
    useEffect(() => {
        if (!isAuthenticated) return;

        const checkTimeout = () => {
            const now = Date.now();
            if (now - lastActivity > SESSION_TIMEOUT) {
                logout();
            }
        };

        timeoutRef.current = setInterval(checkTimeout, 60000);

        return () => {
            if (timeoutRef.current) {
                clearInterval(timeoutRef.current);
            }
        };
    }, [isAuthenticated, lastActivity]);

    // Track user activity
    useEffect(() => {
        if (!isAuthenticated) return;

        const updateActivity = () => setLastActivity(Date.now());

        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keypress', updateActivity);
        window.addEventListener('click', updateActivity);
        window.addEventListener('scroll', updateActivity);

        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keypress', updateActivity);
            window.removeEventListener('click', updateActivity);
            window.removeEventListener('scroll', updateActivity);
        };
    }, [isAuthenticated]);

    const verifyToken = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }

            const response = await fetch(getApiUrl('/api/auth/verify'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setIsAuthenticated(data.valid);

            if (!data.valid) {
                logout();
            } else {
                setLastActivity(Date.now());
                setUserRole(data.role || 'admin');
                setPermissions(data.permissions || ['all']);
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            setIsAuthenticated(false);
            setUserRole(null);
            setPermissions([]);
            localStorage.removeItem('admin_token');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (password) => {
        try {
            const apiUrl = getApiUrl('/api/auth/login');
            console.log('Attempting login to:', apiUrl); // Debug log

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            console.log('Response status:', response.status); // Debug log
            console.log('Response ok:', response.ok); // Debug log

            // Check if response is ok (status 200-299)
            if (!response.ok) {
                // Try to get error message from response
                let errorMessage = `HTTP Error ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch {
                    // Response wasn't JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                console.error('Login failed with status:', response.status, errorMessage);
                return { success: false, error: errorMessage };
            }

            // Check content type
            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType); // Debug log

            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                return { success: false, error: 'Invalid server response (not JSON)' };
            }

            const data = await response.json();
            console.log('Login response data:', data); // Debug log (remove in production!)

            if (data.success && data.token) {
                localStorage.setItem('admin_token', data.token);
                localStorage.setItem('admin_last_activity', Date.now().toString());
                setIsAuthenticated(true);
                setLastActivity(Date.now());
                setUserRole(data.role || 'admin');
                setPermissions(data.permissions || ['all']);
                return { success: true, role: data.role };
            }

            // If we got here, success was false or no token
            return { 
                success: false, 
                error: data.error || data.message || 'Login failed - invalid credentials' 
            };

        } catch (error) {
            console.error('Login error:', error); // This will now show in console
            
            // Check for specific error types
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                return { success: false, error: 'Cannot connect to server. Check if API is running.' };
            }
            
            return { success: false, error: error.message || 'Connection failed' };
        }
    };

    const logout = useCallback(async () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_last_activity');
        setIsAuthenticated(false);
        setUserRole(null);
        setPermissions([]);
        if (timeoutRef.current) {
            clearInterval(timeoutRef.current);
        }
        navigate('/');
    }, [navigate]);

    // Save activity to localStorage periodically for tab persistence
    useEffect(() => {
        if (isAuthenticated) {
            localStorage.setItem('admin_last_activity', lastActivity.toString());
        }
    }, [lastActivity, isAuthenticated]);

    // Keyboard shortcut: Shift + Ctrl + X to go to Admin Panel
    const handleKeyDown = useCallback((e) => {
        if (e.shiftKey && e.ctrlKey && e.key.toLowerCase() === 'x') {
            e.preventDefault();
            navigate('/admin');
        }
    }, [navigate]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const value = {
        isAuthenticated,
        isLoading,
        login,
        logout,
        lastActivity,
        userRole,
        permissions,
        isAdmin: userRole === 'admin',
        isBlogEditor: userRole === 'blog_editor',
        hasPermission: (permission) => permissions.includes('all') || permissions.includes(permission)
    };

    return (
        <AdminContext.Provider value={value}>
            {!isLoading && children}
        </AdminContext.Provider>
    );
};

export default AdminContext;