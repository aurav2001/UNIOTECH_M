// Production Backend - Security Hardened + Load Balanced
require('dotenv').config();
const cluster = require('cluster');
const os = require('os');
const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { sendContactEmail, sendCallbackEmail, sendEnquiryEmail, sendTicketEmails } = require('./services/emailService');
const { sanitizeObject, validateContactForm, validateCallbackForm, validateEnquiryForm, validateTicketForm } = require('./utils/validation');
const Submission = require('./models/Submission');
const Client = require('./models/Client');

const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;
const NODE_ENV = process.env.NODE_ENV;

// Exit if required env vars missing
if (!PORT || !JWT_SECRET) process.exit(1);

// Security middleware
app.use(helmet({
  // Allow inline scripts for JSON-LD structured data
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(cookieParser());

// SEO: Add X-Robots-Tag header to allow indexing on all public routes
app.use((req, res, next) => {
  // Don't index admin or auth routes
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/submissions')) {
    res.set('X-Robots-Tag', 'noindex, nofollow');
  } else {
    res.set('X-Robots-Tag', 'index, follow');
  }
  next();
});

// Allowed frontend origins from env
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : [];

// Strict access control - blocks all direct API access
app.use((req, res, next) => {
  // Allow root and health endpoints for debugging
  if (req.path === '/' || req.path === '/api/health') {
    return next();
  }

  // Allow sitemap.xml for search engine crawlers (public endpoint)
  if (req.path === '/api/sitemap.xml' || req.path === '/robots.txt') {
    return next();
  }

  // Allow localhost:4173 (Vite Preview / Prerender) to access API
  const origin = req.headers.origin;
  if (origin && origin.includes('localhost:4173')) {
    return next();
  }

  // Allow blog SEO pages (server-rendered HTML for crawlers)
  if (req.path.startsWith('/api/blog-seo')) {
    return next();
  }

  // Allow public read-only API endpoints for EVERYONE (blogs, pages, content)
  // These are public data — no auth needed. This ensures Google's renderer,
  // Bing's renderer, social media link previews, and any client can fetch data.
  const isPublicReadEndpoint = req.method === 'GET' && (
    req.path.startsWith('/api/blogs') ||
    req.path.startsWith('/api/pages') ||
    req.path.startsWith('/api/content')
  );
  if (isPublicReadEndpoint) {
    return next();
  }

  const referer = req.headers.referer;
  let requestSource = origin;

  if (!requestSource && referer) {
    try { requestSource = new URL(referer).origin; } catch { requestSource = null; }
  }

  const isAllowedOrigin = requestSource && allowedOrigins.some(allowed =>
    requestSource === allowed || requestSource.startsWith(allowed)
  );

  // Allow if from authorized origin OR if no origin (Postman/server-side)
  if (isAllowedOrigin || !requestSource) return next();
  return res.status(403).json({ error: 'Access denied', message: 'This API only accepts requests from authorized applications' });
});

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-side, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed'), false);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
let dbStatus = "Initializing...";
let dbError = null;
sequelize.authenticate()
  .then(() => {
    dbStatus = "Connected";
    console.log('Database connected successfully');
    // Using regular sync instead of alter to avoid index duplication
    return sequelize.sync().then(async () => {
      // Safely add missing columns to database tables if they don't exist
      const queryInterface = sequelize.getQueryInterface();
      const DataTypes = require('sequelize').DataTypes;
      
      const safeAddColumn = async (table, colName, colDef) => {
        try {
          await queryInterface.addColumn(table, colName, colDef);
          console.log(`Added ${colName} column to ${table}`);
        } catch (e) {
          // Column already exists or table sync handled it, ignore
        }
      };

      await safeAddColumn('submissions', 'companyId', { type: DataTypes.STRING(255), allowNull: true });
      await safeAddColumn('submissions', 'clientId', { type: DataTypes.INTEGER, allowNull: true });
      await safeAddColumn('submissions', 'priority', { type: DataTypes.STRING(20), defaultValue: 'medium' });
      await safeAddColumn('submissions', 'remindersCount', { type: DataTypes.INTEGER, defaultValue: 0 });
      await safeAddColumn('submissions', 'lastRemindedAt', { type: DataTypes.DATE, allowNull: true });
      await safeAddColumn('submissions', 'adminResponse', { type: DataTypes.TEXT, allowNull: true });
      await safeAddColumn('submissions', 'respondedAt', { type: DataTypes.DATE, allowNull: true });
      await safeAddColumn('submissions', 'attachments', { type: DataTypes.TEXT, allowNull: true });
      await safeAddColumn('submissions', 'slaDeadline', { type: DataTypes.DATE, allowNull: true });
      await safeAddColumn('submissions', 'resolvedAt', { type: DataTypes.DATE, allowNull: true });
      await safeAddColumn('submissions', 'slaBreached', { type: DataTypes.BOOLEAN, defaultValue: false });
      await safeAddColumn('clients', 'status', { type: DataTypes.STRING(20), defaultValue: 'pending' });

      // Backfill SLA deadline for existing tickets if missing
      try {
        const { calculateSLADeadline } = require('./utils/slaHelper');
        const ticketsWithoutSla = await Submission.findAll({
          where: {
            type: 'ticket',
            slaDeadline: null
          }
        });
        for (const t of ticketsWithoutSla) {
          t.slaDeadline = calculateSLADeadline(t.priority, t.createdAt);
          if (t.status === 'resolved' || t.status === 'closed') {
            t.resolvedAt = t.updatedAt || t.createdAt;
            t.slaBreached = t.resolvedAt > t.slaDeadline;
          }
          await t.save();
        }
      } catch (backfillErr) {
        console.error('SLA backfill notice:', backfillErr.message);
      }
    });
  })
  .catch((err) => {
    dbStatus = "Disconnected";
    dbError = err.message;
    console.error('Database connection failed:', err.message);
  });

// Cloudinary Diagnostics connection verification
let cloudinaryStatus = "Testing...";
let cloudinaryError = null;
const testCloudinaryConn = async () => {
  try {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    // Upload a small 1px transparent gif
    const result = await cloudinary.uploader.upload(
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      { folder: 'uniotech_uploads', public_id: 'test_connection' }
    );
    cloudinaryStatus = "Connected (" + result.secure_url + ")";
  } catch (error) {
    cloudinaryStatus = "Failed";
    cloudinaryError = error.message;
    console.error("Cloudinary test failed:", error.message);
  }
};
testCloudinaryConn();

// API routes
try {
  app.use('/api/content', require('./routes/content'));
  app.use('/api/pages', require('./routes/pages'));
  app.use('/api/upload', require('./routes/upload'));
  app.use('/api/careers', require('./routes/careers'));
  app.use('/api/submissions', require('./routes/submissions'));
  app.use('/api/blogs', require('./routes/blogRoutes'));
  app.use('/api/client', require('./routes/clientAuth'));
  // Dynamic sitemap - serves XML with all pages + dynamically fetched blogs
  app.use('/api/sitemap.xml', require('./routes/sitemap'));
  // Blog SEO fallback - serves crawlable HTML for blog posts (for search engines)
  app.use('/api/blog-seo', require('./routes/blogSeo'));
} catch (error) {
  console.error('Failed to load routes:', error);
}

// Serve robots.txt from API domain (tells crawlers about the sitemap)
app.get('/robots.txt', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /api/sitemap.xml
Allow: /api/blogs
Allow: /api/blog-seo
Disallow: /api/auth
Disallow: /api/submissions
Disallow: /api/upload`);
});

// Explicit ping route for monitoring
app.get('/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    status: "API is running",
    health: dbStatus === "Connected" ? "healthy" : "degraded",
    dbStatus: dbStatus,
    dbError: dbError,
    cloudinaryCheck: {
      status: cloudinaryStatus,
      error: cloudinaryError
    },
    envCheck: {
      hasDbHost: !!process.env.DB_HOST,
      hasDbName: !!process.env.DB_NAME,
      hasDbUser: !!process.env.DB_USER,
      hasDbPass: !!process.env.DB_PASS,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasCloudinaryCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasCloudinaryApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasCloudinaryApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS
    }
  });
});

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again in 15 minutes.' }
});

// Auth verification
app.get('/api/auth/verify', (req, res) => {
  let token = req.cookies.admin_token;

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) return res.status(401).json({ valid: false, error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      valid: true,
      admin: decoded.admin,
      role: decoded.role || (decoded.admin ? 'admin' : 'blog_editor'),
      permissions: decoded.permissions || (decoded.admin ? ['all'] : ['blogs'])
    });
  } catch { res.status(401).json({ valid: false, error: 'Invalid token' }); }
});

// Admin login (supports both admin and blog editor roles)
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { password } = req.body;
  const adminPass = process.env.ADMIN_PASSWORD;
  const blogEditorPass = process.env.BLOG_EDITOR_PASSWORD;

  if (!adminPass) return res.status(500).json({ success: false, error: 'Server configuration error' });

  let tokenPayload = null;
  let userRole = null;

  // Check for admin login
  if (password === adminPass) {
    tokenPayload = {
      admin: true,
      role: 'admin',
      permissions: ['all'],
      loginIP: req.ip
    };
    userRole = 'admin';
  }
  // Check for blog editor login
  else if (blogEditorPass && password === blogEditorPass) {
    tokenPayload = {
      admin: false,
      role: 'blog_editor',
      permissions: ['blogs'],
      loginIP: req.ip
    };
    userRole = 'blog_editor';
  }

  if (tokenPayload) {
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    // Set HttpOnly cookie
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      role: userRole,
      permissions: tokenPayload.permissions
    });
  }

  res.status(401).json({ success: false, error: 'Invalid password' });
});

// Admin logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// Form submission rate limiter
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many submissions, please try again later.' }
});

// Contact form
app.post('/api/contact', formLimiter, async (req, res) => {
  try {
    const sanitizedData = sanitizeObject(req.body, true);
    const validation = validateContactForm(sanitizedData);
    if (!validation.isValid) {
      const errorMsg = Object.values(validation.errors)[0] || 'Invalid form data';
      return res.status(400).json({ success: false, error: errorMsg, errors: validation.errors });
    }

    const submission = await Submission.create({
      type: 'contact', name: sanitizedData.name, email: sanitizedData.email,
      phone: sanitizedData.phone || null, subject: sanitizedData.subject,
      message: sanitizedData.message, ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    try {
      await sendContactEmail(sanitizedData);
    } catch (emailError) {
      console.error('SMTP Email sending failed for contact submission:', emailError.message);
    }
    res.json({ success: true, message: 'Message sent successfully', submissionId: submission.id });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message', details: error.message });
  }
});

// Callback request
app.post('/api/callback', formLimiter, async (req, res) => {
  try {
    const sanitizedData = sanitizeObject(req.body, true);
    const validation = validateCallbackForm(sanitizedData);
    if (!validation.isValid) {
      const errorMsg = Object.values(validation.errors)[0] || 'Invalid form data';
      return res.status(400).json({ success: false, error: errorMsg, errors: validation.errors });
    }

    const submission = await Submission.create({
      type: 'callback', name: sanitizedData.name, phone: sanitizedData.phone,
      preferredTime: sanitizedData.time || 'Anytime', ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    try {
      await sendCallbackEmail(sanitizedData);
    } catch (emailError) {
      console.error('SMTP Email sending failed for callback submission:', emailError.message);
    }
    res.json({ success: true, message: 'Callback request sent successfully', submissionId: submission.id });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit callback request', details: error.message });
  }
});

// Enquiry form
app.post('/api/enquiry', formLimiter, async (req, res) => {
  try {
    const sanitizedData = sanitizeObject(req.body, true);
    const validation = validateEnquiryForm(sanitizedData);
    if (!validation.isValid) {
      const errorMsg = Object.values(validation.errors)[0] || 'Invalid form data';
      return res.status(400).json({ success: false, error: errorMsg, errors: validation.errors });
    }

    const submission = await Submission.create({
      type: 'enquiry', name: sanitizedData.name, email: sanitizedData.email,
      phone: sanitizedData.phone, message: sanitizedData.message,
      source: sanitizedData.source || 'General Enquiry', ipAddress: req.ip, userAgent: req.headers['user-agent']
    });

    try {
      await sendEnquiryEmail(sanitizedData);
    } catch (emailError) {
      console.error('SMTP Email sending failed for enquiry submission:', emailError.message);
    }
    res.json({ success: true, message: 'Enquiry sent successfully', submissionId: submission.id });
  } catch (error) {
    console.error('Enquiry error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit enquiry', details: error.message });
  }
});

// Ticket form
app.post('/api/ticket', formLimiter, async (req, res) => {
  try {
    const sanitizedData = sanitizeObject(req.body, true);
    const validation = validateTicketForm(sanitizedData);
    if (!validation.isValid) {
      const errorMsg = Object.values(validation.errors)[0] || 'Invalid ticket data';
      return res.status(400).json({ success: false, error: errorMsg, errors: validation.errors });
    }

    // Handle authentication (check if request is from a logged-in client)
    let clientCompanyId = null;
    let clientId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        clientCompanyId = decoded.companyId;
        clientId = decoded.id;
      } catch (err) {
        console.log('Ticket request had invalid bearer token, proceeding as anonymous.');
      }
    }

    const ticketPriority = ['low', 'medium', 'high', 'urgent'].includes(sanitizedData.priority?.toLowerCase())
      ? sanitizedData.priority.toLowerCase()
      : 'medium';

    // Parse attachments if present
    let attachmentsData = null;
    let attachmentsList = [];
    if (req.body.attachments) {
      if (Array.isArray(req.body.attachments)) {
        attachmentsList = req.body.attachments;
        attachmentsData = JSON.stringify(req.body.attachments);
      } else if (typeof req.body.attachments === 'string') {
        try {
          attachmentsList = JSON.parse(req.body.attachments);
          attachmentsData = req.body.attachments;
        } catch (e) {
          attachmentsData = null;
        }
      }
    }

    const { calculateSLADeadline } = require('./utils/slaHelper');
    const slaDeadline = calculateSLADeadline(ticketPriority);

    const submission = await Submission.create({
      type: 'ticket', name: sanitizedData.name, email: sanitizedData.email,
      subject: sanitizedData.subject, message: sanitizedData.message,
      priority: ticketPriority,
      attachments: attachmentsData,
      slaDeadline: slaDeadline,
      ipAddress: req.ip, userAgent: req.headers['user-agent'],
      companyId: clientCompanyId, clientId: clientId
    });

    try {
      await sendTicketEmails({
        id: submission.id,
        name: sanitizedData.name,
        email: sanitizedData.email,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        priority: ticketPriority,
        companyId: clientCompanyId,
        attachments: attachmentsList
      });
    } catch (emailError) {
      console.error('SMTP Email sending failed for ticket submission:', emailError.message);
    }
    res.json({ success: true, message: 'Ticket created successfully', submissionId: submission.id });
  } catch (error) {
    console.error('Ticket error:', error);
    res.status(500).json({ success: false, error: 'Failed to create ticket', details: error.message });
  }
});


// Auth middleware for protected routes
const authMiddleware = (req, res, next) => {
  let token = req.cookies.admin_token;

  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) return res.status(401).json({ error: 'No token provided' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
};

// Get all submissions (admin)
app.get('/api/submissions', authMiddleware, async (req, res) => {
  try {
    const { type, status, limit = 100, offset = 0 } = req.query;
    const where = {};
    if (type && ['contact', 'callback', 'enquiry', 'career', 'ticket'].includes(type)) where.type = type;
    if (status && ['new', 'read', 'resolved'].includes(status)) where.status = status;

    const submissions = await Submission.findAndCountAll({
      where, order: [['createdAt', 'DESC']], limit: parseInt(limit), offset: parseInt(offset)
    });
    res.json({ success: true, data: submissions.rows, total: submissions.count });
  } catch { res.status(500).json({ success: false, error: 'Failed to fetch submissions' }); }
});

// Submissions stats (admin)
app.get('/api/submissions/stats', authMiddleware, async (req, res) => {
  try {
    const [
      contactCount, callbackCount, enquiryCount, careerCount, ticketCount,
      newContactCount, newCallbackCount, newEnquiryCount, newCareerCount, newTicketCount
    ] = await Promise.all([
      Submission.count({ where: { type: 'contact' } }),
      Submission.count({ where: { type: 'callback' } }),
      Submission.count({ where: { type: 'enquiry' } }),
      Submission.count({ where: { type: 'career' } }),
      Submission.count({ where: { type: 'ticket' } }),
      Submission.count({ where: { type: 'contact', status: 'new' } }),
      Submission.count({ where: { type: 'callback', status: 'new' } }),
      Submission.count({ where: { type: 'enquiry', status: 'new' } }),
      Submission.count({ where: { type: 'career', status: 'new' } }),
      Submission.count({ where: { type: 'ticket', status: 'new' } })
    ]);
    res.json({
      success: true,
      stats: {
        contact: { total: contactCount, new: newContactCount },
        callback: { total: callbackCount, new: newCallbackCount },
        enquiry: { total: enquiryCount, new: newEnquiryCount },
        career: { total: careerCount, new: newCareerCount },
        ticket: { total: ticketCount, new: newTicketCount },
        totalNew: newContactCount + newCallbackCount + newEnquiryCount + newCareerCount + newTicketCount
      }
    });
  } catch { res.status(500).json({ success: false, error: 'Failed to fetch stats' }); }
});

// Get single submission (admin)
app.get('/api/submissions/:id', authMiddleware, async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: submission });
  } catch { res.status(500).json({ success: false, error: 'Failed to fetch submission' }); }
});

// Update submission status (admin)
app.put('/api/submissions/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'read', 'approved', 'in_progress', 'resolved', 'rejected', 'closed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ success: false, error: 'Not found' });
    submission.status = status;
    await submission.save();
    res.json({ success: true, data: submission });
  } catch { res.status(500).json({ success: false, error: 'Failed to update submission' }); }
});

// Delete submission (admin)
app.delete('/api/submissions/:id', authMiddleware, async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);
    if (!submission) return res.status(404).json({ success: false, error: 'Not found' });
    await submission.destroy();
    res.json({ success: true, message: 'Submission deleted' });
  } catch { res.status(500).json({ success: false, error: 'Failed to delete submission' }); }
});

// SMTP diagnostic (admin)
app.get('/api/email-check', authMiddleware, async (req, res) => {
  try {
    const nodemailer = require('nodemailer');
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;
    if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
      return res.status(500).json({ success: false, error: 'Email configuration incomplete' });
    }
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST, port: parseInt(EMAIL_PORT), secure: parseInt(EMAIL_PORT) === 465,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS }
    });
    await transporter.verify();
    res.json({ success: true, message: 'SMTP is working correctly' });
  } catch { res.status(500).json({ success: false, error: 'SMTP verification failed' }); }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK', timestamp: new Date().toISOString(),
    worker: cluster.isWorker ? cluster.worker.id : 'primary',
    pid: process.pid, uptime: Math.floor(process.uptime()) + 's',
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
  });
});

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err); // Log error for debugging
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Cluster mode for load balancing (production only)
// Toggleable via USE_CLUSTER env var for cPanel compatibility
const useCluster = process.env.USE_CLUSTER === 'true';
const numCPUs = process.env.CLUSTER_WORKERS ? parseInt(process.env.CLUSTER_WORKERS) : Math.min(os.cpus().length, 4);

if (cluster.isPrimary && process.env.NODE_ENV === 'production' && useCluster) {
  for (let i = 0; i < numCPUs; i++) cluster.fork();

  cluster.on('exit', (worker, code) => {
    if (code !== 0 && !worker.exitedAfterDisconnect) cluster.fork();
  });

  const gracefulShutdown = () => {
    for (const id in cluster.workers) cluster.workers[id].send('shutdown');
    setTimeout(() => process.exit(0), 30000);
  };
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

} else {
  const server = app.listen(PORT);

  process.on('message', (msg) => {
    if (msg === 'shutdown') server.close(() => process.exit(0));
  });

  process.on('uncaughtException', () => server.close(() => process.exit(1)));
  process.on('unhandledRejection', () => server.close(() => process.exit(1)));
}
