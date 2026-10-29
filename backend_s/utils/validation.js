/**
 * Backend Validation & Sanitization Utilities
 * Protects against XSS, SQL Injection, and malicious input
 */

// HTML special characters to escape
const HTML_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

// SQL injection patterns to detect
const SQL_INJECTION_PATTERNS = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION|DECLARE)\b)/gi,
    /(--)|(;)|(\/\*)|(\*\/)/g,
    /(\'|\")(\s)*(\bOR\b|\bAND\b)/gi,
    /(\bOR\b|\bAND\b)(\s)*(\d+)(\s)*(=)(\s)*(\d+)/gi
];

// XSS patterns to detect
const XSS_PATTERNS = [
    /<script\b[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,
    /<object\b[^>]*>[\s\S]*?<\/object>/gi,
    /<embed\b[^>]*>/gi,
    /data:text\/html/gi
];

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str - Input string
 * @returns {string} - Escaped string
 */
const escapeHtml = (str) => {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[&<>"'`=\/]/g, char => HTML_ENTITIES[char] || char);
};

/**
 * Remove potential SQL injection patterns
 * @param {string} str - Input string
 * @returns {string} - Cleaned string
 */
const sanitizeSql = (str) => {
    if (!str || typeof str !== 'string') return '';
    let cleaned = str;
    SQL_INJECTION_PATTERNS.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
    });
    return cleaned.trim();
};

/**
 * Remove potential XSS patterns
 * @param {string} str - Input string
 * @returns {string} - Cleaned string
 */
const sanitizeXss = (str) => {
    if (!str || typeof str !== 'string') return '';
    let cleaned = str;
    XSS_PATTERNS.forEach(pattern => {
        cleaned = cleaned.replace(pattern, '');
    });
    return cleaned.trim();
};

/**
 * Full sanitization - escapes HTML and removes malicious patterns
 * @param {string} str - Input string
 * @returns {string} - Fully sanitized string
 */
const sanitize = (str) => {
    if (!str || typeof str !== 'string') return '';
    let cleaned = sanitizeXss(str);
    cleaned = sanitizeSql(cleaned);
    return escapeHtml(cleaned);
};

/**
 * Light sanitization for display (preserves basic formatting)
 * @param {string} str - Input string
 * @returns {string} - Light sanitized string
 */
const sanitizeLight = (str) => {
    if (!str || typeof str !== 'string') return '';
    let cleaned = sanitizeXss(str);
    cleaned = sanitizeSql(cleaned);
    return cleaned.trim();
};

/**
 * Validate email format
 * @param {string} email - Email string
 * @returns {boolean} - Is valid email
 */
const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Validate phone number
 * @param {string} phone - Phone string
 * @returns {boolean} - Is valid phone
 */
const isValidPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    // Must be at least 10 digits, can start with +
    return /^\+?[0-9]{10,15}$/.test(cleaned);
};

/**
 * Validate name (letters, spaces, hyphens, apostrophes)
 * @param {string} name - Name string
 * @returns {boolean} - Is valid name
 */
const isValidName = (name) => {
    if (!name || typeof name !== 'string') return false;
    const trimmed = name.trim();
    return trimmed.length >= 2 && /^[a-zA-Z0-9\s\-'\.&,()]+$/.test(trimmed);
};

/**
 * Check if string is not empty and meets minimum length
 * @param {string} str - Input string
 * @param {number} minLength - Minimum length (default 1)
 * @returns {boolean} - Is valid
 */
const isRequired = (str, minLength = 1) => {
    if (!str || typeof str !== 'string') return false;
    return str.trim().length >= minLength;
};

/**
 * Sanitize an entire object's string properties
 * @param {object} obj - Object to sanitize
 * @param {boolean} light - Use light sanitization (default false)
 * @returns {object} - Sanitized object
 */
const sanitizeObject = (obj, light = false) => {
    if (!obj || typeof obj !== 'object') return {};
    const sanitized = {};
    const sanitizeFn = light ? sanitizeLight : sanitize;
    
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeFn(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value, light);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

/**
 * Validate contact form data
 * @param {object} data - { name, email, subject, message }
 * @returns {object} - { isValid, errors }
 */
const validateContactForm = (data) => {
    const errors = {};
    
    if (!isRequired(data.name, 2)) {
        errors.name = 'Name must be at least 2 characters';
    } else if (!isValidName(data.name)) {
        errors.name = 'Please enter a valid name';
    }
    
    if (!isRequired(data.email)) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    if (!isRequired(data.subject, 3)) {
        errors.subject = 'Subject must be at least 3 characters';
    }
    
    if (!isRequired(data.message, 10)) {
        errors.message = 'Message must be at least 10 characters';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate callback form data
 * @param {object} data - { name, phone, time }
 * @returns {object} - { isValid, errors }
 */
const validateCallbackForm = (data) => {
    const errors = {};
    
    if (!isRequired(data.name, 2)) {
        errors.name = 'Name must be at least 2 characters';
    }
    
    if (!isRequired(data.phone)) {
        errors.phone = 'Phone number is required';
    } else if (!isValidPhone(data.phone)) {
        errors.phone = 'Please enter a valid phone number';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate enquiry form data
 * @param {object} data - { name, email, phone, message, source }
 * @returns {object} - { isValid, errors }
 */
const validateEnquiryForm = (data) => {
    const errors = {};
    
    if (!isRequired(data.name, 2)) {
        errors.name = 'Name must be at least 2 characters';
    } else if (!isValidName(data.name)) {
        errors.name = 'Please enter a valid name';
    }
    
    if (!isRequired(data.email)) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    if (!isRequired(data.phone)) {
        errors.phone = 'Phone number is required';
    } else if (!isValidPhone(data.phone)) {
        errors.phone = 'Please enter a valid phone number';
    }
    
    if (!isRequired(data.message, 10)) {
        errors.message = 'Message must be at least 10 characters';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate support ticket form data
 * @param {object} data - { name, email, subject, message }
 * @returns {object} - { isValid, errors }
 */
const validateTicketForm = (data) => {
    const errors = {};
    
    if (!isRequired(data.name, 2)) {
        errors.name = 'Name must be at least 2 characters';
    } else if (!isValidName(data.name)) {
        errors.name = 'Please enter a valid name';
    }
    
    if (!isRequired(data.email)) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    if (!isRequired(data.subject, 3)) {
        errors.subject = 'Subject must be at least 3 characters';
    }
    
    if (!isRequired(data.message, 5)) {
        errors.message = 'Description must be at least 5 characters';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
};

module.exports = {
    escapeHtml,
    sanitize,
    sanitizeLight,
    sanitizeSql,
    sanitizeXss,
    sanitizeObject,
    isValidEmail,
    isValidPhone,
    isValidName,
    isRequired,
    validateContactForm,
    validateCallbackForm,
    validateEnquiryForm,
    validateTicketForm,
    validateCareerForm: (data) => {
        const errors = {};
        if (!isRequired(data.name, 2)) errors.name = 'Name is required';
        if (!isRequired(data.email) || !isValidEmail(data.email)) errors.email = 'Valid email is required';
        if (!isRequired(data.phone) || !isValidPhone(data.phone)) errors.phone = 'Valid phone is required';
        if (!isRequired(data.cvUrl)) errors.cvUrl = 'CV upload is required';
        return { isValid: Object.keys(errors).length === 0, errors };
    }
};
