// Form validation utilities for UnioTech IT

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex (supports various formats)
 * Allows: +1234567890, 123-456-7890, (123) 456-7890, etc.
 */
const PHONE_REGEX = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    return EMAIL_REGEX.test(email.trim());
};

/**
 * Validate phone number format
 * @param {string} phone 
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
    if (!phone || typeof phone !== 'string') return false;
    const cleaned = phone.replace(/\s/g, '');
    return cleaned.length >= 10 && PHONE_REGEX.test(cleaned);
};

/**
 * Validate required field (not empty, not only whitespace)
 * @param {string} value 
 * @param {number} minLength - Minimum length (default: 1)
 * @returns {boolean}
 */
export const isRequired = (value, minLength = 1) => {
    if (!value || typeof value !== 'string') return false;
    return value.trim().length >= minLength;
};

/**
 * Validate name (letters, spaces, hyphens, apostrophes only)
 * @param {string} name 
 * @returns {boolean}
 */
export const isValidName = (name) => {
    if (!name || typeof name !== 'string') return false;
    return name.trim().length >= 2 && /^[a-zA-Z0-9\s\-'\.&,()]+$/.test(name.trim());
};

/**
 * Validate contact form data
 * @param {object} data - { name, email, subject, message }
 * @returns {object} - { isValid, errors }
 */
export const validateContactForm = (data) => {
    const errors = {};

    // Name validation
    if (!isRequired(data.name, 2)) {
        errors.name = 'Name must be at least 2 characters';
    } else if (!isValidName(data.name)) {
        errors.name = 'Please enter a valid name';
    }

    // Email validation
    if (!isRequired(data.email)) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }

    // Subject validation
    if (!isRequired(data.subject, 3)) {
        errors.subject = 'Subject must be at least 3 characters';
    }

    // Message validation
    if (!isRequired(data.message, 10)) {
        errors.message = 'Message must be at least 10 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate callback form data
 * @param {object} data - { name, phone, time }
 * @returns {object} - { isValid, errors }
 */
export const validateCallbackForm = (data) => {
    const errors = {};

    // Name validation
    if (!isRequired(data.name, 2)) {
        errors.name = 'Name must be at least 2 characters';
    }

    // Phone validation
    if (!isRequired(data.phone)) {
        errors.phone = 'Phone number is required';
    } else if (!isValidPhone(data.phone)) {
        errors.phone = 'Please enter a valid phone number (min 10 digits)';
    }

    // Time is optional but should be selected if present
    // No validation needed for time as it's from a dropdown

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate admin login
 * @param {string} password 
 * @returns {object} - { isValid, errors }
 */
export const validateAdminLogin = (password) => {
    const errors = {};

    if (!isRequired(password, 1)) {
        errors.password = 'Password is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input 
 * @returns {string}
 */
export const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') return '';
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .trim();
};

/**
 * Validate enquiry form data
 * @param {object} data - { name, email, phone, message }
 * @returns {object} - { isValid, errors }
 */
export const validateEnquiryForm = (data) => {
    const errors = {};
    
    // Name validation
    if (!isRequired(data.name, 2)) {
        errors.name = 'Name must be at least 2 characters';
    } else if (!isValidName(data.name)) {
        errors.name = 'Please enter a valid name';
    }

    // Email validation
    if (!isRequired(data.email)) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!isRequired(data.phone)) {
        errors.phone = 'Phone number is required';
    } else if (!isValidPhone(data.phone)) {
        errors.phone = 'Please enter a valid phone number (min 10 digits)';
    }

    // Message validation
    if (!isRequired(data.message, 10)) {
        errors.message = 'Message must be at least 10 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate support ticket form data
 * @param {object} data - { name, email, subject, message }
 * @returns {object} - { isValid, errors }
 */
export const validateTicketForm = (data) => {
    const errors = {};

    // Name validation
    if (!isRequired(data.name, 2)) {
        errors.name = 'Name must be at least 2 characters';
    } else if (!isValidName(data.name)) {
        errors.name = 'Please enter a valid name';
    }

    // Email validation
    if (!isRequired(data.email)) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }

    // Subject validation
    if (!isRequired(data.subject, 3)) {
        errors.subject = 'Subject must be at least 3 characters';
    }

    // Message validation
    if (!isRequired(data.message, 5)) {
        errors.message = 'Description must be at least 5 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export default {
    isValidEmail,
    isValidPhone,
    isRequired,
    isValidName,
    validateContactForm,
    validateCallbackForm,
    validateAdminLogin,
    validateEnquiryForm,
    validateTicketForm,
    sanitizeInput
};
