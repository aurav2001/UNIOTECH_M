// Centralized API utility for production-ready configuration
// All API calls should use this module

const FALLBACK_API_URL = 'https://api.uniotechit.com';

const getBaseUrl = () => {
    // 1. Explicitly check if we are on localhost/127.0.0.1
    const isLocalhost = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // 2. If on localhost, prefer the environment variable if it's also local, 
    // or fallback to empty string to use the Vite proxy (/api)
    if (isLocalhost) {
        const envUrl = import.meta.env.VITE_API_URL;
        if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
            return envUrl;
        }
        // Fallback to relative path for Vite proxy
        return '';
    }

    // 3. Not on localhost, use env var if available
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // 4. Final fallback for production
    return FALLBACK_API_URL;
};

const API_BASE_URL = getBaseUrl();

/**
 * Get the full API URL for a given endpoint
 * @param {string} endpoint - API endpoint (e.g., '/api/pages')
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint = '') => {
    // Ensure base url doesn't have trailing slash
    const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    // Ensure endpoint has leading slash
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
};

/**
 * Get image URL - handles both relative and absolute URLs
 * @param {string} url - Image URL (can be relative or absolute)
 * @returns {string} Full image URL
 */
export const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @param {string} token - JWT token for authentication
 * @returns {Promise<Response>}
 */
export const apiRequest = async (endpoint, options = {}, token = null) => {
    const url = getApiUrl(endpoint);

    // Get token from localStorage if not provided
    const authToken = token || localStorage.getItem('admin_token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    return fetch(url, {
        ...options,
        headers,
    });
};

/**
 * Upload a file to the API
 * @param {string} endpoint - Upload endpoint
 * @param {FormData} formData - Form data with file
 * @param {string} token - JWT token
 * @returns {Promise<Response>}
 */
export const uploadFile = async (endpoint, formData, token) => {
    const url = getApiUrl(endpoint);
    const authToken = token || localStorage.getItem('admin_token');

    return fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`
        },
        body: formData,
    });
};

/**
 * Check if a URL/path is external
 * @param {string} url - URL or path to check
 * @returns {boolean}
 */
export const isExternalLink = (url) => {
    if (!url || typeof url !== 'string') return false;
    const cleanUrl = url.trim();
    if (/^https?:\/\//i.test(cleanUrl)) return true;
    if (!cleanUrl.startsWith('/') && !cleanUrl.startsWith('#')) {
        // Domain name check (e.g. domain.com or subdomain.domain.org)
        if (/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(cleanUrl)) {
            return true;
        }
    }
    return false;
};

/**
 * Get formatted URL - prepends https:// to external links if missing protocol
 * @param {string} url - URL or path to format
 * @returns {string} Formatted URL/path
 */
export const getFormattedUrl = (url) => {
    if (!url) return '';
    const cleanUrl = url.trim();
    if (isExternalLink(cleanUrl)) {
        if (/^https?:\/\//i.test(cleanUrl)) {
            return cleanUrl;
        }
        return `https://${cleanUrl}`;
    }
    return cleanUrl;
};

export default {
    API_BASE_URL,
    getApiUrl,
    getImageUrl,
    apiRequest,
    uploadFile,
    isExternalLink,
    getFormattedUrl,
};

