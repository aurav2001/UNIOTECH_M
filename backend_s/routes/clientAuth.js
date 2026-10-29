const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Client = require('../models/Client');
const Submission = require('../models/Submission');
const ClientDocument = require('../models/ClientDocument');
const { Op } = require('sequelize');
const { isValidEmail, isRequired } = require('../utils/validation');
const { sendTicketReminderEmail, sendClientReplyToAdminEmail } = require('../services/emailService');
const { clientUpload, uploadToCloudinaryOrLocal } = require('../utils/fileUploader');

// Middleware to verify client token
const clientAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.client = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }
};

// Middleware to verify admin token
const adminAuthMiddleware = (req, res, next) => {
    let token = req.cookies?.admin_token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access denied. Admin token required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.admin && decoded.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Forbidden: Admin access required.' });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired admin token.' });
    }
};

// Helper to safely parse attachments
const parseAttachments = (attachments) => {
    if (!attachments) return [];
    if (Array.isArray(attachments)) return attachments;
    try {
        const parsed = JSON.parse(attachments);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
};

// POST /api/client/register - Register a new client
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, companyId, phone } = req.body;

        // Validation
        if (!isRequired(name, 2)) {
            return res.status(400).json({ success: false, error: 'Name must be at least 2 characters.' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
        }
        if (!isRequired(password, 6)) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
        }
        if (!isRequired(companyId, 2)) {
            return res.status(400).json({ success: false, error: 'Company ID must be at least 2 characters.' });
        }

        // Check if email already registered
        const existingClient = await Client.findOne({ where: { email } });
        if (existingClient) {
            return res.status(400).json({ success: false, error: 'Email is already registered.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create client with pending status
        const client = await Client.create({
            name,
            email,
            password: hashedPassword,
            companyId: companyId.trim().toUpperCase(),
            phone: phone || null,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Account registered successfully! Your account is currently pending approval by the administrator.',
            isPending: true,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                companyId: client.companyId,
                status: client.status
            }
        });
    } catch (error) {
        console.error('Client registration error:', error);
        res.status(500).json({ success: false, error: 'Registration failed. Server error.' });
    }
});

// POST /api/client/login - Login a client
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!isValidEmail(email) || !isRequired(password)) {
            return res.status(400).json({ success: false, error: 'Invalid credentials format.' });
        }

        // Find client
        const client = await Client.findOne({ where: { email } });
        if (!client) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, client.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        // Check approval status
        if (client.status === 'pending') {
            return res.status(403).json({
                success: false,
                isPending: true,
                error: 'Your account is currently pending administrator approval. Please wait for activation.'
            });
        }

        if (client.status === 'rejected') {
            return res.status(403).json({
                success: false,
                isRejected: true,
                error: 'Your account registration was rejected by the administrator. Contact support for help.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: client.id, name: client.name, email: client.email, companyId: client.companyId, status: client.status },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Logged in successfully',
            token,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                companyId: client.companyId,
                phone: client.phone,
                status: client.status
            }
        });
    } catch (error) {
        console.error('Client login error:', error);
        res.status(500).json({ success: false, error: 'Login failed. Server error.' });
    }
});

// GET /api/client/profile - Get logged-in client details
router.get('/profile', clientAuthMiddleware, async (req, res) => {
    try {
        const client = await Client.findByPk(req.client.id, {
            attributes: ['id', 'name', 'email', 'companyId', 'phone', 'status']
        });

        if (!client) {
            return res.status(404).json({ success: false, error: 'Client profile not found.' });
        }

        res.json({
            success: true,
            client
        });
    } catch (error) {
        console.error('Fetch client profile error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch profile. Server error.' });
    }
});

// GET /api/client/tickets - Get tickets submitted by this client/company
router.get('/tickets', clientAuthMiddleware, async (req, res) => {
    try {
        const client = await Client.findByPk(req.client.id);
        if (!client) {
            return res.status(404).json({ success: false, error: 'Client not found.' });
        }

        const clientMatchConditions = [];
        if (client.id) clientMatchConditions.push({ clientId: client.id });
        if (client.companyId) clientMatchConditions.push({ companyId: client.companyId });
        if (client.email) clientMatchConditions.push({ email: client.email });

        const tickets = await Submission.findAll({
            where: {
                type: 'ticket',
                [Op.or]: clientMatchConditions
            },
            order: [['createdAt', 'DESC']],
            attributes: [
                'id', 'name', 'email', 'subject', 'message', 'status', 'priority', 'attachments',
                'remindersCount', 'lastRemindedAt', 'companyId', 'adminResponse', 'respondedAt',
                'slaDeadline', 'resolvedAt', 'slaBreached', 'createdAt', 'updatedAt'
            ]
        });

        const { getSLAMetrics } = require('../utils/slaHelper');

        const formattedTickets = tickets.map(t => {
            const data = t.toJSON();
            data.attachments = parseAttachments(data.attachments);
            data.slaMetrics = getSLAMetrics(data);
            return data;
        });

        res.json({
            success: true,
            tickets: formattedTickets
        });
    } catch (error) {
        console.error('Fetch client tickets error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch client tickets.' });
    }
});

// POST /api/client/upload - Upload file(s) for tickets or client documents (supports multiple files)
router.post('/upload', clientAuthMiddleware, clientUpload.array('files', 5), async (req, res) => {
    try {
        const files = req.files || (req.file ? [req.file] : []);
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, error: 'No files uploaded.' });
        }

        const uploadedResults = [];
        for (const file of files) {
            const uploadRes = await uploadToCloudinaryOrLocal(file, 'uniotech_client_files');
            uploadedResults.push(uploadRes);
        }

        res.json({
            success: true,
            message: `${uploadedResults.length} file(s) uploaded successfully`,
            files: uploadedResults,
            file: uploadedResults[0] // convenient single file reference
        });
    } catch (error) {
        console.error('Client file upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'File upload failed. Please verify file format and size.'
        });
    }
});

// GET /api/client/documents - Get all documents/files for the logged-in client / company
router.get('/documents', clientAuthMiddleware, async (req, res) => {
    try {
        const client = await Client.findByPk(req.client.id);
        if (!client) {
            return res.status(404).json({ success: false, error: 'Client not found.' });
        }

        const companyId = client.companyId;
        const documents = await ClientDocument.findAll({
            where: {
                [Op.or]: [
                    { companyId: companyId },
                    { clientId: client.id }
                ]
            },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            documents
        });
    } catch (error) {
        console.error('Fetch client documents error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch company documents.' });
    }
});

// POST /api/client/documents - Save/Upload a new document into company repository
router.post('/documents', clientAuthMiddleware, clientUpload.single('file'), async (req, res) => {
    try {
        const client = await Client.findByPk(req.client.id);
        if (!client) {
            return res.status(404).json({ success: false, error: 'Client not found.' });
        }

        let fileName = req.body.fileName;
        let fileUrl = req.body.fileUrl;
        let fileType = req.body.fileType;
        let fileSize = req.body.fileSize;
        let publicId = req.body.publicId || null;
        const category = req.body.category || 'general';
        const description = req.body.description || '';

        // If file was directly attached in this multipart request
        if (req.file) {
            const uploadRes = await uploadToCloudinaryOrLocal(req.file, 'uniotech_client_documents');
            fileName = uploadRes.name;
            fileUrl = uploadRes.url;
            fileType = uploadRes.type;
            fileSize = uploadRes.size;
            publicId = uploadRes.publicId;
        }

        if (!fileUrl) {
            return res.status(400).json({ success: false, error: 'File URL or attachment is required.' });
        }

        if (!fileName) {
            fileName = 'Document_' + Date.now();
        }

        const document = await ClientDocument.create({
            clientId: client.id,
            companyId: client.companyId,
            clientName: client.name,
            fileName: fileName.trim(),
            fileUrl: fileUrl.trim(),
            fileType: fileType || 'document',
            fileSize: fileSize || null,
            publicId: publicId,
            category: category,
            description: description.trim()
        });

        res.status(201).json({
            success: true,
            message: 'Document saved to company repository successfully!',
            document
        });
    } catch (error) {
        console.error('Create client document error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to save document.' });
    }
});

// DELETE /api/client/documents/:id - Delete a document
router.delete('/documents/:id', clientAuthMiddleware, async (req, res) => {
    try {
        const client = await Client.findByPk(req.client.id);
        if (!client) {
            return res.status(404).json({ success: false, error: 'Client not found.' });
        }

        const document = await ClientDocument.findOne({
            where: {
                id: req.params.id,
                [Op.or]: [
                    { companyId: client.companyId },
                    { clientId: client.id }
                ]
            }
        });

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found or unauthorized.' });
        }

        await document.destroy();
        res.json({
            success: true,
            message: 'Document removed successfully.'
        });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete document.' });
    }
});

// POST /api/client/tickets/:id/remind - Client sends reminder/nudge to admin
router.post('/tickets/:id/remind', clientAuthMiddleware, async (req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await Submission.findOne({
            where: {
                id: ticketId,
                type: 'ticket'
            }
        });

        if (!ticket) {
            return res.status(404).json({ success: false, error: 'Ticket not found.' });
        }

        const isOwner = ticket.clientId === req.client.id ||
            ticket.companyId === req.client.companyId ||
            ticket.email?.toLowerCase() === req.client.email?.toLowerCase();

        if (!isOwner) {
            return res.status(403).json({ success: false, error: 'Unauthorized to remind on this ticket.' });
        }

        if (ticket.lastRemindedAt) {
            const lastTime = new Date(ticket.lastRemindedAt).getTime();
            const now = Date.now();
            const diffMinutes = (now - lastTime) / (1000 * 60);
            if (diffMinutes < 5) {
                return res.status(429).json({
                    success: false,
                    error: `You recently sent a reminder. Please wait ${Math.ceil(5 - diffMinutes)} minutes before sending another.`
                });
            }
        }

        ticket.remindersCount = (ticket.remindersCount || 0) + 1;
        ticket.lastRemindedAt = new Date();
        await ticket.save();

        try {
            await sendTicketReminderEmail(ticket, req.client.name);
        } catch (emailErr) {
            console.error('Failed to send ticket reminder email:', emailErr.message);
        }

        res.json({
            success: true,
            message: 'Reminder sent to the Admin team! We will follow up promptly.',
            remindersCount: ticket.remindersCount,
            lastRemindedAt: ticket.lastRemindedAt
        });
    } catch (error) {
        console.error('Send ticket reminder error:', error);
        res.status(500).json({ success: false, error: 'Failed to send reminder. Please try again.' });
    }
});

// POST /api/client/tickets/:id/reply - Client posts a reply/update to their existing ticket (with optional attachments)
router.post('/tickets/:id/reply', clientAuthMiddleware, async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { message, attachments } = req.body;

        if ((!message || !message.trim()) && (!attachments || attachments.length === 0)) {
            return res.status(400).json({ success: false, error: 'Reply message or attachment is required.' });
        }

        const ticket = await Submission.findOne({
            where: {
                id: ticketId,
                type: 'ticket'
            }
        });

        if (!ticket) {
            return res.status(404).json({ success: false, error: 'Ticket not found.' });
        }

        const isOwner = ticket.clientId === req.client.id ||
            ticket.companyId === req.client.companyId ||
            ticket.email?.toLowerCase() === req.client.email?.toLowerCase();

        if (!isOwner) {
            return res.status(403).json({ success: false, error: 'Unauthorized to reply to this ticket.' });
        }

        const newAttachments = parseAttachments(attachments);
        const existingAttachments = parseAttachments(ticket.attachments);
        const mergedAttachments = [...existingAttachments, ...newAttachments];

        const timestamp = new Date().toLocaleString('en-IN');
        let updateEntry = `\n\n--- [Client Reply by ${req.client.name} at ${timestamp}] ---\n${(message || '').trim()}`;
        if (newAttachments.length > 0) {
            const names = newAttachments.map(a => a.name).join(', ');
            updateEntry += `\n📎 Attached files: ${names}`;
        }

        ticket.message = (ticket.message || '') + updateEntry;
        ticket.attachments = JSON.stringify(mergedAttachments);

        if (ticket.status === 'resolved' || ticket.status === 'closed' || ticket.status === 'read' || ticket.status === 'new') {
            ticket.status = 'in_progress';
        }
        await ticket.save();

        try {
            await sendClientReplyToAdminEmail(ticket, req.client.name, (message || '').trim());
        } catch (emailErr) {
            console.error('Failed to send client reply email to admin:', emailErr.message);
        }

        res.json({
            success: true,
            message: 'Your reply has been added to the ticket!',
            ticket: {
                ...ticket.toJSON(),
                attachments: mergedAttachments
            }
        });
    } catch (error) {
        console.error('Ticket reply error:', error);
        res.status(500).json({ success: false, error: 'Failed to post reply. Please try again.' });
    }
});

/* ============================================================
   ADMIN CLIENT MANAGEMENT ENDPOINTS
============================================================ */

// GET /api/client/admin/list - Admin lists all registered clients
router.get('/admin/list', adminAuthMiddleware, async (req, res) => {
    try {
        const clients = await Client.findAll({
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'name', 'email', 'companyId', 'phone', 'status', 'createdAt', 'updatedAt']
        });

        const clientsWithStats = await Promise.all(clients.map(async (c) => {
            const ticketCount = await Submission.count({
                where: {
                    type: 'ticket',
                    [Op.or]: [
                        { clientId: c.id },
                        { companyId: c.companyId },
                        { email: c.email }
                    ]
                }
            });
            const documentCount = await ClientDocument.count({
                where: {
                    [Op.or]: [
                        { clientId: c.id },
                        { companyId: c.companyId }
                    ]
                }
            });
            return {
                ...c.toJSON(),
                ticketCount,
                documentCount
            };
        }));

        res.json({
            success: true,
            clients: clientsWithStats
        });
    } catch (error) {
        console.error('Admin fetch clients error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch registered clients.' });
    }
});

// GET /api/client/admin/documents - Admin lists all client documents
router.get('/admin/documents', adminAuthMiddleware, async (req, res) => {
    try {
        const { companyId } = req.query;
        const where = {};
        if (companyId) {
            where.companyId = companyId.toUpperCase();
        }

        const documents = await ClientDocument.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            documents
        });
    } catch (error) {
        console.error('Admin fetch client documents error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch client documents.' });
    }
});

// PUT /api/client/admin/:id/status - Admin updates client status
router.put('/admin/:id/status', adminAuthMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status. Must be pending, approved, or rejected.' });
        }

        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ success: false, error: 'Client not found.' });
        }

        client.status = status;
        await client.save();

        res.json({
            success: true,
            message: `Client account status updated to ${status}.`,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                companyId: client.companyId,
                status: client.status
            }
        });
    } catch (error) {
        console.error('Admin update client status error:', error);
        res.status(500).json({ success: false, error: 'Failed to update client status.' });
    }
});

// DELETE /api/client/admin/:id - Admin deletes a client account
router.delete('/admin/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ success: false, error: 'Client not found.' });
        }

        await client.destroy();
        res.json({ success: true, message: 'Client account deleted successfully.' });
    } catch (error) {
        console.error('Admin delete client error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete client account.' });
    }
});

module.exports = router;
