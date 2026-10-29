const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Protect routes - verify token
exports.protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Authorize by role
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // If user is full admin (from the JWT payload), allow access to everything
        if (req.user && req.user.admin === true) {
            return next();
        }
        
        // If specific roles required and user has one of them
        if (roles.length > 0 && req.user && roles.includes(req.user.role)) {
            return next();
        }
        
        // Check permissions array (for granular access like 'blogs')
        if (req.user && req.user.permissions) {
            const requiredPermission = roles[0]; // e.g., 'admin' or 'blog_editor'
            if (req.user.permissions.includes('all') || 
                req.user.permissions.includes('blogs') && requiredPermission === 'blog_editor') {
                return next();
            }
        }
        
        return res.status(403).json({ error: 'Not authorized to access this resource' });
    };
};
