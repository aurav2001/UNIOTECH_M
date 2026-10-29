import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';

const ContentContext = createContext();

export const useContent = () => {
    const context = useContext(ContentContext);
    if (!context) {
        throw new Error('useContent must be used within a ContentProvider');
    }
    return context;
};

export const ContentProvider = ({ children }) => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const res = await fetch(getApiUrl('/api/content'));
            if (!res.ok) {
                throw new Error('Failed to fetch content');
            }
            const data = await res.json();
            setContent(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const refreshContent = () => {
        return fetchContent();
    };

    // Helper to safely get content with fallback
    const getContent = (section, key, fallback = '') => {
        if (!content || !content[section]) return fallback;

        // If no key provided, return the whole section object
        if (!key) {
            return content[section];
        }

        // Handle nested keys safely
        return content[section][key] !== undefined ? content[section][key] : fallback;
    };

    const value = {
        content,
        loading,
        error,
        refreshContent,
        getContent
    };

    return (
        <ContentContext.Provider value={value}>
            {children}
        </ContentContext.Provider>
    );
};

export default ContentContext;
