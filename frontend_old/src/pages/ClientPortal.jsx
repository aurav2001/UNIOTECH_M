import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClient } from '../context/ClientContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
    User, Mail, Lock, Building, Phone, ArrowRight, AlertCircle, LogIn, 
    CheckCircle, Ticket, Clock, Plus, RefreshCw, Send, Bell, Zap,
    UploadCloud, FileText, Paperclip, Trash2, Download, ExternalLink,
    File, Image as ImageIcon, Folder, Check, X, Search, Filter, ShieldCheck
} from 'lucide-react';
import SEO from '../components/SEO';
import { getApiUrl } from '../utils/api';
import SLATimerBadge from '../components/SLATimerBadge';

const ClientPortal = () => {
    const { login, register, isAuthenticated, client, logout } = useClient();
    const navigate = useNavigate();
    const [isLoginTab, setIsLoginTab] = useState(true);
    const [activePortalTab, setActivePortalTab] = useState('tickets'); // 'tickets' | 'documents'
    
    // Form States (Login & Register)
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regCompanyId, setRegCompanyId] = useState('');
    const [regPhone, setRegPhone] = useState('');
    
    // Status states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Tickets State
    const [tickets, setTickets] = useState([]);
    const [ticketsLoading, setTicketsLoading] = useState(false);
    const [showRaiseModal, setShowRaiseModal] = useState(false);
    const [newTicketSubject, setNewTicketSubject] = useState('');
    const [newTicketMessage, setNewTicketMessage] = useState('');
    const [newTicketPriority, setNewTicketPriority] = useState('medium');
    const [ticketAttachments, setTicketAttachments] = useState([]);
    const [ticketUploadingFile, setTicketUploadingFile] = useState(false);
    const [ticketSubmitting, setTicketSubmitting] = useState(false);
    const [ticketModalError, setTicketModalError] = useState('');
    const [ticketModalSuccess, setTicketModalSuccess] = useState('');

    // Remind admin states
    const [remindingTicketId, setRemindingTicketId] = useState(null);
    const [remindFeedback, setRemindFeedback] = useState({ ticketId: null, message: '', type: 'success' });

    // Client Reply states
    const [clientReplyText, setClientReplyText] = useState({});
    const [replyAttachments, setReplyAttachments] = useState({});
    const [replyUploadingFile, setReplyUploadingFile] = useState({});
    const [replySubmittingId, setReplySubmittingId] = useState(null);
    const [replySuccessMsg, setReplySuccessMsg] = useState({});

    // Company Documents State
    const [documents, setDocuments] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [docCategoryFilter, setDocCategoryFilter] = useState('all');
    const [docSearchQuery, setDocSearchQuery] = useState('');
    const [showDocUploadModal, setShowDocUploadModal] = useState(false);
    const [newDocCategory, setNewDocCategory] = useState('general');
    const [newDocDescription, setNewDocDescription] = useState('');
    const [newDocFiles, setNewDocFiles] = useState([]);
    const [docUploading, setDocUploading] = useState(false);
    const [docModalError, setDocModalError] = useState('');
    const [docModalSuccess, setDocModalSuccess] = useState('');

    // File Preview Modal State (for images/PDFs)
    const [previewFile, setPreviewFile] = useState(null);

    // Fetch client tickets & documents on login
    useEffect(() => {
        if (isAuthenticated && client) {
            fetchClientTickets();
            fetchClientDocuments();
        }
    }, [isAuthenticated, client]);

    const fetchClientTickets = async () => {
        setTicketsLoading(true);
        try {
            const token = localStorage.getItem('client_token');
            const res = await fetch(getApiUrl('/api/client/tickets'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.tickets)) {
                setTickets(data.tickets);
            }
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
        } finally {
            setTicketsLoading(false);
        }
    };

    const fetchClientDocuments = async () => {
        setDocsLoading(true);
        try {
            const token = localStorage.getItem('client_token');
            const res = await fetch(getApiUrl('/api/client/documents'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && Array.isArray(data.documents)) {
                setDocuments(data.documents);
            }
        } catch (err) {
            console.error('Failed to fetch documents:', err);
        } finally {
            setDocsLoading(false);
        }
    };

    // Generic file uploader helper using POST /api/client/upload
    const uploadFilesToServer = async (fileList) => {
        const token = localStorage.getItem('client_token');
        const formData = new FormData();
        Array.from(fileList).forEach(file => {
            formData.append('files', file);
        });

        const res = await fetch(getApiUrl('/api/client/upload'), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to upload file');
        }

        return data.files || (data.file ? [data.file] : []);
    };

    // Format file size
    const formatFileSize = (bytes) => {
        if (!bytes || isNaN(bytes)) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Get Icon according to file type
    const getFileIcon = (fileType = '', fileName = '') => {
        const ext = (fileName.split('.').pop() || '').toLowerCase();
        const type = (fileType || '').toLowerCase();

        if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext) || type.includes('image')) {
            return <ImageIcon size={18} className="text-blue-500 shrink-0" />;
        }
        if (['pdf'].includes(ext) || type.includes('pdf')) {
            return <FileText size={18} className="text-red-500 shrink-0" />;
        }
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || type.includes('zip') || type.includes('archive')) {
            return <Folder size={18} className="text-amber-500 shrink-0" />;
        }
        return <File size={18} className="text-indigo-500 shrink-0" />;
    };

    // Handle ticket creation attachments upload
    const handleTicketFilesSelect = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setTicketUploadingFile(true);
        setTicketModalError('');
        try {
            const uploaded = await uploadFilesToServer(files);
            setTicketAttachments(prev => [...prev, ...uploaded]);
        } catch (err) {
            setTicketModalError(err.message || 'File upload failed');
        } finally {
            setTicketUploadingFile(false);
            e.target.value = '';
        }
    };

    const handleRemoveTicketAttachment = (indexToRemove) => {
        setTicketAttachments(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    // Handle reply attachments upload
    const handleReplyFilesSelect = async (ticketId, e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setReplyUploadingFile(prev => ({ ...prev, [ticketId]: true }));
        try {
            const uploaded = await uploadFilesToServer(files);
            setReplyAttachments(prev => ({
                ...prev,
                [ticketId]: [...(prev[ticketId] || []), ...uploaded]
            }));
        } catch (err) {
            alert(err.message || 'Attachment upload failed');
        } finally {
            setReplyUploadingFile(prev => ({ ...prev, [ticketId]: false }));
            e.target.value = '';
        }
    };

    const handleRemoveReplyAttachment = (ticketId, indexToRemove) => {
        setReplyAttachments(prev => ({
            ...prev,
            [ticketId]: (prev[ticketId] || []).filter((_, idx) => idx !== indexToRemove)
        }));
    };

    // Handle Send Reply with text & attachments
    const handleSendClientReply = async (ticketId) => {
        const text = clientReplyText[ticketId];
        const attached = replyAttachments[ticketId] || [];

        if ((!text || !text.trim()) && attached.length === 0) return;

        setReplySubmittingId(ticketId);
        try {
            const token = localStorage.getItem('client_token');
            const res = await fetch(getApiUrl(`/api/client/tickets/${ticketId}/reply`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    message: text ? text.trim() : '',
                    attachments: attached
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setReplySuccessMsg(prev => ({ ...prev, [ticketId]: 'Reply & attachments sent successfully!' }));
                setClientReplyText(prev => ({ ...prev, [ticketId]: '' }));
                setReplyAttachments(prev => ({ ...prev, [ticketId]: [] }));
                setTimeout(() => {
                    setReplySuccessMsg(prev => ({ ...prev, [ticketId]: '' }));
                }, 3000);
                fetchClientTickets();
            } else {
                alert(data.error || 'Failed to send reply');
            }
        } catch (err) {
            alert('Connection error while sending reply');
        } finally {
            setReplySubmittingId(null);
        }
    };

    const handleRemindAdmin = async (ticketId) => {
        setRemindingTicketId(ticketId);
        setRemindFeedback({ ticketId: null, message: '', type: 'success' });
        try {
            const token = localStorage.getItem('client_token');
            const res = await fetch(getApiUrl(`/api/client/tickets/${ticketId}/remind`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: 'Client reminded' })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setRemindFeedback({
                    ticketId,
                    message: data.message || 'Notification sent to Admin team! We will follow up shortly.',
                    type: 'success'
                });
                fetchClientTickets();
            } else {
                setRemindFeedback({
                    ticketId,
                    message: data.error || 'Could not send reminder at this time.',
                    type: 'error'
                });
            }
        } catch (err) {
            setRemindFeedback({
                ticketId,
                message: 'Connection error while sending reminder.',
                type: 'error'
            });
        } finally {
            setRemindingTicketId(null);
            setTimeout(() => setRemindFeedback({ ticketId: null, message: '', type: 'success' }), 5000);
        }
    };

    const handleCreateTicketInPortal = async (e) => {
        e.preventDefault();
        if (!newTicketSubject || !newTicketMessage) {
            setTicketModalError('Please fill in subject and message.');
            return;
        }
        setTicketSubmitting(true);
        setTicketModalError('');
        try {
            const token = localStorage.getItem('client_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(getApiUrl('/api/ticket'), {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: client.name,
                    email: client.email,
                    subject: newTicketSubject,
                    message: newTicketMessage,
                    priority: newTicketPriority,
                    attachments: ticketAttachments
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setTicketModalSuccess(`Ticket created successfully! (ID: #${data.submissionId})`);
                setNewTicketSubject('');
                setNewTicketMessage('');
                setNewTicketPriority('medium');
                setTicketAttachments([]);
                fetchClientTickets();
                setTimeout(() => {
                    setShowRaiseModal(false);
                    setTicketModalSuccess('');
                }, 2000);
            } else {
                const errorMsg = data.error || (data.errors ? Object.values(data.errors).join(', ') : 'Failed to submit ticket. Please check all fields.');
                setTicketModalError(errorMsg);
            }
        } catch (err) {
            setTicketModalError('Connection error. Please try again.');
        } finally {
            setTicketSubmitting(false);
        }
    };

    // Company Document Upload Handler
    const handleUploadCompanyDocument = async (e) => {
        e.preventDefault();
        if (newDocFiles.length === 0) {
            setDocModalError('Please select at least one file to upload.');
            return;
        }

        setDocUploading(true);
        setDocModalError('');
        setDocModalSuccess('');
        try {
            const token = localStorage.getItem('client_token');
            
            // Upload each file and create a document record
            for (const fileObj of newDocFiles) {
                await fetch(getApiUrl('/api/client/documents'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        fileName: fileObj.name,
                        fileUrl: fileObj.url,
                        fileType: fileObj.type,
                        fileSize: fileObj.size,
                        publicId: fileObj.publicId,
                        category: newDocCategory,
                        description: newDocDescription
                    })
                });
            }

            setDocModalSuccess('Documents uploaded and added to your company repository successfully!');
            setNewDocFiles([]);
            setNewDocDescription('');
            setNewDocCategory('general');
            fetchClientDocuments();
            setTimeout(() => {
                setShowDocUploadModal(false);
                setDocModalSuccess('');
            }, 2000);
        } catch (err) {
            setDocModalError(err.message || 'Failed to save document. Please try again.');
        } finally {
            setDocUploading(false);
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!window.confirm('Are you sure you want to delete this document from your repository?')) return;

        try {
            const token = localStorage.getItem('client_token');
            const res = await fetch(getApiUrl(`/api/client/documents/${docId}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setDocuments(prev => prev.filter(d => d.id !== docId));
            } else {
                alert(data.error || 'Failed to delete document');
            }
        } catch (err) {
            alert('Error deleting document');
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!loginEmail || !loginPassword) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        setError('');
        
        const res = await login(loginEmail, loginPassword);
        setLoading(false);
        
        if (res.success) {
            setSuccess('Logged in successfully!');
        } else {
            setError(res.error || 'Invalid credentials. Please try again.');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!regName || !regEmail || !regPassword || !regCompanyId) {
            setError('Please fill in all required fields (Name, Email, Password, Company ID).');
            return;
        }
        if (regPassword.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        setError('');
        
        const res = await register(regName, regEmail, regPassword, regCompanyId, regPhone);
        setLoading(false);
        
        if (res.success) {
            setSuccess(res.message || 'Registration submitted successfully! Your account is pending administrator approval.');
            setTimeout(() => {
                setIsLoginTab(true);
            }, 3500);
        } else {
            setError(res.error || 'Registration failed. Email might already be registered.');
        }
    };

    // Filter documents
    const filteredDocuments = documents.filter(doc => {
        const matchesCategory = docCategoryFilter === 'all' || doc.category === docCategoryFilter;
        const matchesSearch = !docSearchQuery || 
            doc.fileName?.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
            doc.description?.toLowerCase().includes(docSearchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (isAuthenticated && client) {
        return (
            <div className="bg-[#f8fafc] min-h-screen pt-24 md:pt-32 pb-24 font-sans text-gray-800">
                <SEO title="Client Portal | UnioTech IT Solutions" description="Access the UnioTech IT client portal and documents." />
                
                <div className="container mx-auto px-4 md:px-8 max-w-6xl">
                    {/* Header Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200/90 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gradient-to-tr from-primary-medium to-primary-dark text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-primary-medium/20">
                                <Building size={32} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">{client.name}</h1>
                                    <span className="px-3.5 py-1 bg-primary-medium/10 text-primary-dark font-black text-xs rounded-full uppercase tracking-wider border border-primary-medium/20">
                                        ID: {client.companyId}
                                    </span>
                                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-full border border-emerald-200 flex items-center gap-1">
                                        <ShieldCheck size={13} className="text-emerald-600" /> Active Client
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-2 flex-wrap">
                                    <span className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400" /> {client.email}</span>
                                    {client.phone && <span className="text-gray-300">|</span>}
                                    {client.phone && <span className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400" /> {client.phone}</span>}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={() => setShowRaiseModal(true)}
                                className="bg-primary-medium hover:bg-primary-dark text-white font-bold px-5 py-3 rounded-xl transition-all flex items-center gap-2 shadow-md shadow-primary-medium/25 text-sm hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Plus size={18} /> Raise Support Ticket
                            </button>
                            <button
                                onClick={() => setShowDocUploadModal(true)}
                                className="bg-white border border-gray-200 text-gray-700 hover:text-primary-dark hover:border-primary-medium font-bold px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-sm shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <UploadCloud size={18} className="text-primary-medium" /> Upload File
                            </button>
                            <button
                                onClick={logout}
                                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 font-bold px-4 py-3 rounded-xl transition-colors text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </motion.div>

                    {/* Stats & Quick Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Ticket size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Tickets</p>
                                <p className="text-2xl font-black text-gray-900 mt-0.5">{tickets.length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Open / Pending</p>
                                <p className="text-2xl font-black text-amber-600 mt-0.5">
                                    {tickets.filter(t => t.status === 'new' || t.status === 'in_progress' || t.status === 'approved').length}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resolved</p>
                                <p className="text-2xl font-black text-green-600 mt-0.5">
                                    {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <Folder size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company Files</p>
                                <p className="text-2xl font-black text-indigo-600 mt-0.5">{documents.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs (Tickets vs Documents) */}
                    <div className="flex items-center gap-3 border-b border-gray-200/80 pb-4 mb-6">
                        <button
                            onClick={() => setActivePortalTab('tickets')}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                activePortalTab === 'tickets'
                                    ? 'bg-primary-medium text-white shadow-sm shadow-primary-medium/30'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                            }`}
                        >
                            <Ticket size={18} /> Support Tickets ({tickets.length})
                        </button>
                        <button
                            onClick={() => setActivePortalTab('documents')}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                activePortalTab === 'documents'
                                    ? 'bg-primary-medium text-white shadow-sm shadow-primary-medium/30'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                            }`}
                        >
                            <Folder size={18} /> My Documents & Files ({documents.length})
                        </button>
                    </div>

                    {/* Remind Feedback Alert */}
                    {remindFeedback.message && (
                        <div className={`mb-6 p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 ${
                            remindFeedback.type === 'success' 
                                ? 'bg-green-50 border-green-200 text-green-800' 
                                : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            {remindFeedback.type === 'success' ? <CheckCircle size={18} className="text-green-600 shrink-0" /> : <AlertCircle size={18} className="text-red-600 shrink-0" />}
                            <span>{remindFeedback.message}</span>
                        </div>
                    )}

                    {/* ============================================================ */}
                    {/* TAB 1: SUPPORT TICKETS LIST */}
                    {/* ============================================================ */}
                    {activePortalTab === 'tickets' && (
                        <div className="bg-white border border-gray-200/90 rounded-3xl shadow-sm overflow-hidden">
                            <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">Your Support Tickets</h2>
                                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                                        Track technical resolution, upload error screenshots, communicate directly with engineers.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={fetchClientTickets}
                                        disabled={ticketsLoading}
                                        className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
                                        title="Refresh Tickets"
                                    >
                                        <RefreshCw size={18} className={ticketsLoading ? 'animate-spin text-primary-medium' : ''} />
                                    </button>
                                </div>
                            </div>

                            {ticketsLoading ? (
                                <div className="py-20 text-center text-gray-400">
                                    <RefreshCw size={32} className="animate-spin text-primary-medium mx-auto mb-3" />
                                    <p className="text-sm font-semibold">Loading your company tickets...</p>
                                </div>
                            ) : tickets.length === 0 ? (
                                <div className="py-16 text-center px-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
                                        <Ticket size={28} />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-800">No support tickets found</h3>
                                    <p className="text-xs md:text-sm text-gray-400 max-w-sm mx-auto mt-1 mb-6">
                                        You haven't raised any support requests yet. If you are experiencing any technical issue, open a ticket below with error screenshots.
                                    </p>
                                    <button
                                        onClick={() => setShowRaiseModal(true)}
                                        className="bg-primary-medium text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors text-sm inline-flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Raise Your First Ticket
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 md:p-8 space-y-6">
                                    {tickets.map((t) => {
                                        const statusStyles = {
                                            new: 'bg-blue-50 text-blue-700 border-blue-200',
                                            approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                                            in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
                                            resolved: 'bg-green-50 text-green-700 border-green-200',
                                            rejected: 'bg-red-50 text-red-700 border-red-200',
                                            closed: 'bg-gray-100 text-gray-600 border-gray-200'
                                        };
                                        const statusLabels = {
                                            new: 'Under Review',
                                            approved: 'Approved / Queued',
                                            in_progress: 'In Progress',
                                            resolved: 'Resolved',
                                            rejected: 'Rejected',
                                            closed: 'Closed'
                                        };

                                        const priorityStyles = {
                                            low: 'bg-gray-100 text-gray-700 border-gray-200',
                                            medium: 'bg-blue-50 text-blue-700 border-blue-200',
                                            high: 'bg-amber-50 text-amber-700 border-amber-200',
                                            urgent: 'bg-red-50 text-red-700 border-red-200'
                                        };
                                        const priorityLabels = {
                                            low: 'Low',
                                            medium: 'Medium',
                                            high: 'High',
                                            urgent: 'Urgent'
                                        };

                                        const isResolved = t.status === 'resolved' || t.status === 'closed' || t.status === 'rejected';

                                        const dateStr = new Date(t.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        });

                                        const attachmentsList = Array.isArray(t.attachments) ? t.attachments : [];

                                        return (
                                            <div key={t.id} className="bg-white border border-gray-200/90 rounded-3xl p-5 md:p-7 shadow-xs hover:shadow-md transition-all">
                                                {/* Header Row */}
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <span className="px-3 py-1 bg-primary-dark text-white text-xs font-black rounded-xl tracking-wider shadow-xs">
                                                            #{t.id}
                                                        </span>
                                                        <h3 className="text-base md:text-lg font-bold text-gray-900">
                                                            {t.subject || 'Support Ticket'}
                                                        </h3>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${priorityStyles[t.priority?.toLowerCase()] || priorityStyles.medium}`}>
                                                            <Zap size={11} className={t.priority === 'urgent' ? 'text-red-600 animate-pulse' : ''} />
                                                            {priorityLabels[t.priority?.toLowerCase()] || 'Medium'}
                                                        </span>
                                                        <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${statusStyles[t.status] || statusStyles.new}`}>
                                                            {statusLabels[t.status] || t.status}
                                                        </span>
                                                        <SLATimerBadge ticket={t} showTarget={true} />
                                                    </div>

                                                    <div className="flex items-center gap-4 text-xs text-gray-500 self-start lg:self-auto flex-wrap">
                                                        <span className="flex items-center gap-1 text-gray-400 font-medium">
                                                            <Clock size={13} /> {dateStr}
                                                        </span>
                                                        {!isResolved && (
                                                            <button
                                                                onClick={() => handleRemindAdmin(t.id)}
                                                                disabled={remindingTicketId === t.id}
                                                                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                                                                title="Send a reminder / ping to the Admin team"
                                                            >
                                                                <Bell size={13} className={remindingTicketId === t.id ? 'animate-spin' : ''} />
                                                                {remindingTicketId === t.id ? 'Sending...' : 'Remind Admin'}
                                                                {t.remindersCount > 0 && <span className="opacity-80">({t.remindersCount}p)</span>}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Problem Description */}
                                                <div className="mt-4">
                                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                                        Issue Details:
                                                    </p>
                                                    <div className="bg-gray-50/90 rounded-2xl p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap border border-gray-100">
                                                        {t.message}
                                                    </div>
                                                </div>

                                                {/* Ticket Attachments (if any uploaded during ticket creation or reply) */}
                                                {attachmentsList.length > 0 && (
                                                    <div className="mt-4 p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                            <Paperclip size={14} className="text-primary-medium" /> Attached Documents & Screenshots ({attachmentsList.length}):
                                                        </p>
                                                        <div className="flex flex-wrap gap-2.5">
                                                            {attachmentsList.map((fileItem, fIdx) => {
                                                                const isImg = fileItem.name?.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) || fileItem.type?.includes('image');
                                                                return (
                                                                    <div 
                                                                        key={fIdx}
                                                                        className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-gray-200 shadow-2xs hover:border-primary-medium transition-all group"
                                                                    >
                                                                        {getFileIcon(fileItem.type, fileItem.name)}
                                                                        <div className="max-w-[180px] sm:max-w-[240px] truncate">
                                                                            <a 
                                                                                href={fileItem.url} 
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer" 
                                                                                className="text-xs font-bold text-gray-800 hover:text-primary-medium transition-colors truncate block"
                                                                                title={fileItem.name}
                                                                            >
                                                                                {fileItem.name}
                                                                            </a>
                                                                            {fileItem.size && (
                                                                                <span className="text-[10px] text-gray-400 font-medium">
                                                                                    {formatFileSize(fileItem.size)}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <a
                                                                            href={fileItem.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            download={fileItem.name}
                                                                            className="p-1.5 text-gray-400 hover:text-primary-medium hover:bg-gray-50 rounded-lg transition-colors ml-1"
                                                                            title="Download File"
                                                                        >
                                                                            <Download size={13} />
                                                                        </a>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Official Engineer Solution (if present) */}
                                                {t.adminResponse && (
                                                    <div className="mt-4 p-5 bg-gradient-to-br from-blue-50/90 to-indigo-50/80 border border-blue-200/80 rounded-2xl shadow-2xs">
                                                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                                            <span className="font-extrabold text-blue-950 flex items-center gap-2 text-xs uppercase tracking-wide">
                                                                💬 Support Engineer Official Solution:
                                                            </span>
                                                            {t.respondedAt && (
                                                                <span className="text-[11px] text-blue-700 bg-white px-3 py-0.5 rounded-full border border-blue-200 font-bold shadow-xs">
                                                                    {new Date(t.respondedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-900 leading-relaxed font-medium whitespace-pre-wrap bg-white p-4 rounded-xl border border-blue-100/80 text-sm">
                                                            {t.adminResponse}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Client Response Box with Attachment Upload */}
                                                <div className="mt-4 p-5 bg-gray-50/80 border border-gray-200/80 rounded-2xl">
                                                    <label className="block text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                        ✉️ Write Reply / Send Screenshot to Admin:
                                                    </label>
                                                    <textarea
                                                        rows="3"
                                                        value={clientReplyText[t.id] || ''}
                                                        onChange={(e) => setClientReplyText(prev => ({ ...prev, [t.id]: e.target.value }))}
                                                        placeholder="Type your response, further queries, or problem details for the admin team..."
                                                        className="w-full p-4 text-sm bg-white border border-gray-200 rounded-xl focus:border-primary-medium focus:ring-4 focus:ring-primary-light/30 outline-none text-gray-900 transition-all resize-y shadow-2xs"
                                                    ></textarea>

                                                    {/* Reply File Attachments preview list */}
                                                    {(replyAttachments[t.id] || []).length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-2">
                                                            {(replyAttachments[t.id] || []).map((fileObj, rIdx) => (
                                                                <div key={rIdx} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-primary-medium/30 rounded-xl text-xs shadow-2xs">
                                                                    {getFileIcon(fileObj.type, fileObj.name)}
                                                                    <span className="font-semibold text-gray-800 max-w-[150px] truncate">{fileObj.name}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveReplyAttachment(t.id, rIdx)}
                                                                        className="text-gray-400 hover:text-red-600 p-0.5"
                                                                        title="Remove attachment"
                                                                    >
                                                                        <X size={13} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {replySuccessMsg[t.id] && (
                                                        <div className="mt-3 p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-bold flex items-center gap-2">
                                                            <CheckCircle size={16} className="text-green-600 shrink-0" />
                                                            <span>{replySuccessMsg[t.id]}</span>
                                                        </div>
                                                    )}

                                                    <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-2xs transition-all hover:border-primary-medium">
                                                                <Paperclip size={14} className="text-primary-medium" />
                                                                {replyUploadingFile[t.id] ? 'Uploading...' : 'Attach File / Screenshot'}
                                                                <input
                                                                    type="file"
                                                                    multiple
                                                                    disabled={replyUploadingFile[t.id]}
                                                                    onChange={(e) => handleReplyFilesSelect(t.id, e)}
                                                                    className="hidden"
                                                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.log,.zip"
                                                                />
                                                            </label>
                                                            <span className="text-[11px] text-gray-400 hidden sm:inline">
                                                                (PDF, Images, Logs, Max 25MB)
                                                            </span>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            disabled={replySubmittingId === t.id || (!clientReplyText[t.id]?.trim() && (!replyAttachments[t.id] || replyAttachments[t.id].length === 0))}
                                                            onClick={() => handleSendClientReply(t.id)}
                                                            className="px-6 py-2.5 bg-primary-medium hover:bg-primary-dark text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            <Send size={14} className={replySubmittingId === t.id ? 'animate-spin' : ''} />
                                                            {replySubmittingId === t.id ? 'Sending...' : 'Send Message to Admin'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============================================================ */}
                    {/* TAB 2: COMPANY DOCUMENTS & FILES REPOSITORY */}
                    {/* ============================================================ */}
                    {activePortalTab === 'documents' && (
                        <div className="space-y-6">
                            {/* Upload Banner Card */}
                            <div className="bg-gradient-to-br from-primary-dark to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="relative z-10 max-w-xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold tracking-wider uppercase mb-3 border border-white/10">
                                        <Folder size={14} className="text-primary-light" /> Cloud Document Vault
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-black">Company Document Repository</h2>
                                    <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                                        Safely upload, manage, and download all IT service agreements, AMC contracts, monthly diagnostic reports, setup architecture diagrams, and hardware invoices.
                                    </p>
                                </div>

                                <div className="relative z-10">
                                    <button
                                        onClick={() => setShowDocUploadModal(true)}
                                        className="bg-white text-gray-900 hover:bg-primary-light hover:text-gray-950 font-black px-6 py-3.5 rounded-2xl shadow-xl transition-all flex items-center gap-2.5 text-sm hover:scale-105 active:scale-95"
                                    >
                                        <UploadCloud size={20} className="text-primary-dark" /> Upload New Document
                                    </button>
                                </div>

                                {/* Background glow */}
                                <div className="absolute top-0 right-0 w-80 h-80 bg-primary-medium/20 rounded-full blur-3xl pointer-events-none"></div>
                            </div>

                            {/* Search & Category Filter Controls */}
                            <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="relative w-full md:w-80">
                                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={docSearchQuery}
                                        onChange={(e) => setDocSearchQuery(e.target.value)}
                                        placeholder="Search files by name or notes..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs md:text-sm focus:border-primary-medium focus:bg-white outline-none transition-all"
                                    />
                                    {docSearchQuery && (
                                        <button onClick={() => setDocSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Category Badges */}
                                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto overflow-x-auto">
                                    {[
                                        { id: 'all', label: 'All Files' },
                                        { id: 'contract', label: 'Contracts & AMC' },
                                        { id: 'invoice', label: 'Invoices' },
                                        { id: 'report', label: 'IT Reports' },
                                        { id: 'general', label: 'General / Logs' }
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setDocCategoryFilter(cat.id)}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                                                docCategoryFilter === cat.id
                                                    ? 'bg-primary-medium text-white shadow-2xs'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Documents Grid / List */}
                            {docsLoading ? (
                                <div className="py-20 text-center text-gray-400 bg-white rounded-3xl border border-gray-200">
                                    <RefreshCw size={32} className="animate-spin text-primary-medium mx-auto mb-3" />
                                    <p className="text-sm font-semibold">Loading company repository...</p>
                                </div>
                            ) : filteredDocuments.length === 0 ? (
                                <div className="py-16 text-center px-4 bg-white rounded-3xl border border-gray-200">
                                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
                                        <Folder size={28} />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-800">No documents found</h3>
                                    <p className="text-xs md:text-sm text-gray-400 max-w-sm mx-auto mt-1 mb-6">
                                        {docSearchQuery || docCategoryFilter !== 'all' 
                                            ? 'No documents match your active search filter.' 
                                            : 'Your company vault is empty. Upload your first contract, invoice or report.'}
                                    </p>
                                    <button
                                        onClick={() => setShowDocUploadModal(true)}
                                        className="bg-primary-medium text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition-colors text-sm inline-flex items-center gap-2"
                                    >
                                        <UploadCloud size={16} /> Upload Document
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {filteredDocuments.map(doc => {
                                        const dateStr = new Date(doc.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        });

                                        const categoryLabels = {
                                            contract: { label: 'Contract / AMC', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                                            invoice: { label: 'Invoice', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                                            report: { label: 'IT Report', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                                            general: { label: 'General', color: 'bg-gray-100 text-gray-700 border-gray-200' }
                                        };

                                        const cat = categoryLabels[doc.category] || categoryLabels.general;

                                        return (
                                            <div 
                                                key={doc.id}
                                                className="bg-white rounded-3xl border border-gray-200/90 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                                            >
                                                <div>
                                                    <div className="flex items-start justify-between gap-3 mb-3">
                                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                                                            {getFileIcon(doc.fileType, doc.fileName)}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cat.color}`}>
                                                                {cat.label}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteDocument(doc.id)}
                                                                className="p-1.5 text-gray-300 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                                title="Delete file"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <h3 className="font-bold text-gray-900 text-sm md:text-base leading-snug line-clamp-2" title={doc.fileName}>
                                                        {doc.fileName}
                                                    </h3>

                                                    {doc.description && (
                                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                                                            {doc.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                                                    <div className="text-gray-400 font-medium text-[11px]">
                                                        <span>{formatFileSize(doc.fileSize)}</span>
                                                        <span className="mx-1.5">•</span>
                                                        <span>{dateStr}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={doc.fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download={doc.fileName}
                                                            className="px-3 py-1.5 bg-primary-medium/10 hover:bg-primary-medium text-primary-dark hover:text-white rounded-xl font-bold transition-all flex items-center gap-1 text-xs"
                                                        >
                                                            <Download size={13} /> Download
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ============================================================ */}
                {/* MODAL 1: RAISE SUPPORT TICKET WITH FILE ATTACHMENTS */}
                {/* ============================================================ */}
                <AnimatePresence>
                    {showRaiseModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 my-8"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Raise Support Ticket</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Linked to Company ID: <strong>{client.companyId}</strong></p>
                                    </div>
                                    <button
                                        onClick={() => setShowRaiseModal(false)}
                                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {ticketModalError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-center gap-2">
                                        <AlertCircle size={16} className="shrink-0" /> {ticketModalError}
                                    </div>
                                )}
                                {ticketModalSuccess && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl text-xs flex items-center gap-2">
                                        <CheckCircle size={16} className="shrink-0 text-green-600" /> {ticketModalSuccess}
                                    </div>
                                )}

                                <form onSubmit={handleCreateTicketInPortal} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Subject / Issue Summary *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newTicketSubject}
                                            onChange={(e) => setNewTicketSubject(e.target.value)}
                                            placeholder="e.g. Server Unreachable, VPN Authentication failure"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-medium outline-none text-sm transition-all"
                                        />
                                    </div>

                                    {/* Priority Selector with SLA indicator */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Priority Level *</label>
                                            <span className="text-[11px] font-bold text-primary-medium">
                                                ⏱️ SLA: {newTicketPriority === 'urgent' ? '2 Hours' : newTicketPriority === 'high' ? '6 Hours' : newTicketPriority === 'medium' ? '24 Hours' : '48 Hours'} Guaranteed Resolution
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[
                                                { id: 'low', label: 'Low', sla: '48h', active: 'bg-gray-100 border-gray-400 text-gray-900 font-bold' },
                                                { id: 'medium', label: 'Medium', sla: '24h', active: 'bg-blue-50 border-blue-500 text-blue-800 font-bold' },
                                                { id: 'high', label: 'High', sla: '6h', active: 'bg-amber-50 border-amber-500 text-amber-800 font-bold' },
                                                { id: 'urgent', label: 'Urgent', sla: '2h', active: 'bg-red-50 border-red-500 text-red-800 font-bold' }
                                            ].map((p) => {
                                                const isSelected = newTicketPriority === p.id;
                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        onClick={() => setNewTicketPriority(p.id)}
                                                        className={`py-2 px-1.5 rounded-xl text-xs border text-center transition-all ${
                                                            isSelected ? p.active : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <div>{p.label}</div>
                                                        <div className="text-[10px] opacity-75 font-medium">{p.sla} SLA</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Problem Description *</label>
                                        <textarea
                                            rows="4"
                                            required
                                            value={newTicketMessage}
                                            onChange={(e) => setNewTicketMessage(e.target.value)}
                                            placeholder="Describe the issue in detail, error codes, affected devices or software..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-medium outline-none text-sm transition-all resize-none"
                                        ></textarea>
                                    </div>

                                    {/* File Upload Attachment Area */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                                            Attach Screenshots or Log Files (Optional)
                                        </label>
                                        
                                        <label className="border-2 border-dashed border-gray-200 hover:border-primary-medium rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-primary-light/10">
                                            <UploadCloud size={24} className="text-primary-medium mb-1.5" />
                                            <span className="text-xs font-bold text-gray-700">
                                                {ticketUploadingFile ? 'Uploading file...' : 'Click or Drag & Drop to attach files'}
                                            </span>
                                            <span className="text-[11px] text-gray-400 mt-0.5">
                                                Supports Images, PDFs, Word, Excel, Logs, ZIP (Max 25MB)
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                disabled={ticketUploadingFile}
                                                onChange={handleTicketFilesSelect}
                                                className="hidden"
                                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.log,.zip"
                                            />
                                        </label>

                                        {/* Attached Files Pill List */}
                                        {ticketAttachments.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {ticketAttachments.map((fileObj, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                                                        <div className="flex items-center gap-2 truncate">
                                                            {getFileIcon(fileObj.type, fileObj.name)}
                                                            <span className="font-semibold text-gray-800 truncate">{fileObj.name}</span>
                                                            <span className="text-[10px] text-gray-400 shrink-0">({formatFileSize(fileObj.size)})</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveTicketAttachment(idx)}
                                                            className="p-1 text-gray-400 hover:text-red-600 rounded-lg"
                                                            title="Remove"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setShowRaiseModal(false)}
                                            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={ticketSubmitting || ticketUploadingFile}
                                            className="px-6 py-2.5 rounded-xl bg-primary-medium hover:bg-primary-dark text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {ticketSubmitting ? 'Submitting...' : 'Submit Ticket'}
                                            {!ticketSubmitting && <Send size={16} />}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* ============================================================ */}
                {/* MODAL 2: UPLOAD COMPANY DOCUMENT MODAL */}
                {/* ============================================================ */}
                <AnimatePresence>
                    {showDocUploadModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-gray-100 my-8"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Upload Company Document</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">Securely store files in your company vault</p>
                                    </div>
                                    <button
                                        onClick={() => setShowDocUploadModal(false)}
                                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {docModalError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-xs flex items-center gap-2">
                                        <AlertCircle size={16} className="shrink-0" /> {docModalError}
                                    </div>
                                )}
                                {docModalSuccess && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 rounded-xl text-xs flex items-center gap-2">
                                        <CheckCircle size={16} className="shrink-0 text-green-600" /> {docModalSuccess}
                                    </div>
                                )}

                                <form onSubmit={handleUploadCompanyDocument} className="space-y-4">
                                    {/* Category selector */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Document Category *</label>
                                        <select
                                            value={newDocCategory}
                                            onChange={(e) => setNewDocCategory(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-medium outline-none text-sm transition-all bg-white"
                                        >
                                            <option value="general">📁 General Document / Logs</option>
                                            <option value="contract">📜 AMC Contract / Agreement</option>
                                            <option value="invoice">💳 Hardware / Service Invoice</option>
                                            <option value="report">📊 IT Audit / Diagnostic Report</option>
                                        </select>
                                    </div>

                                    {/* File Picker */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Select File(s) *</label>
                                        <label className="border-2 border-dashed border-gray-200 hover:border-primary-medium rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-primary-light/10">
                                            <UploadCloud size={32} className="text-primary-medium mb-2" />
                                            <span className="text-sm font-bold text-gray-800">
                                                Click to browse or drop files here
                                            </span>
                                            <span className="text-xs text-gray-400 mt-1 text-center">
                                                PDF, Word, Excel, Images, ZIP archives (up to 25MB per file)
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={async (e) => {
                                                    const files = e.target.files;
                                                    if (!files || files.length === 0) return;
                                                    setDocUploading(true);
                                                    setDocModalError('');
                                                    try {
                                                        const uploaded = await uploadFilesToServer(files);
                                                        setNewDocFiles(prev => [...prev, ...uploaded]);
                                                    } catch (err) {
                                                        setDocModalError(err.message || 'Upload failed');
                                                    } finally {
                                                        setDocUploading(false);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="hidden"
                                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.log,.zip"
                                            />
                                        </label>

                                        {/* Selected / Uploaded Files List */}
                                        {newDocFiles.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {newDocFiles.map((f, idx) => (
                                                    <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                                                        <div className="flex items-center gap-2 truncate">
                                                            {getFileIcon(f.type, f.name)}
                                                            <span className="font-semibold text-gray-800 truncate">{f.name}</span>
                                                            <span className="text-[10px] text-gray-400 shrink-0">({formatFileSize(f.size)})</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setNewDocFiles(prev => prev.filter((_, i) => i !== idx))}
                                                            className="p-1 text-gray-400 hover:text-red-600 rounded-lg"
                                                            title="Remove file"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Description / Notes */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Document Notes / Description (Optional)</label>
                                        <textarea
                                            rows="2"
                                            value={newDocDescription}
                                            onChange={(e) => setNewDocDescription(e.target.value)}
                                            placeholder="e.g. Annual Maintenance Contract 2026, Q3 Server Audit..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-medium outline-none text-sm transition-all resize-none"
                                        ></textarea>
                                    </div>

                                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setShowDocUploadModal(false)}
                                            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 text-sm transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={docUploading || newDocFiles.length === 0}
                                            className="px-6 py-2.5 rounded-xl bg-primary-medium hover:bg-primary-dark text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {docUploading ? 'Saving Document...' : 'Save to Vault'}
                                            {!docUploading && <Check size={16} />}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Unauthenticated View (Login / Register Tabs)
    return (
        <div className="bg-white min-h-screen pt-24 md:pt-32 pb-20 flex items-center justify-center font-sans relative overflow-hidden">
            <SEO title="Client Portal | UnioTech IT Solutions" description="Access the UnioTech IT client portal and documents." />
            
            {/* Background elements */}
            <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-primary-medium/5 rounded-full blur-3xl pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg w-full mx-6 bg-gray-50 border border-gray-100 rounded-3xl shadow-xl overflow-hidden relative z-10"
            >
                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white">
                    <button
                        onClick={() => { setIsLoginTab(true); setError(''); }}
                        className={`flex-1 py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${isLoginTab ? 'text-primary-medium border-b-2 border-primary-medium bg-gray-50/50' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <LogIn size={18} /> Login
                    </button>
                    <button
                        onClick={() => { setIsLoginTab(false); setError(''); }}
                        className={`flex-1 py-4 font-bold text-sm transition-colors flex items-center justify-center gap-2 ${!isLoginTab ? 'text-primary-medium border-b-2 border-primary-medium bg-gray-50/50' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <User size={18} /> Register
                    </button>
                </div>

                <div className="p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                            {isLoginTab ? 'Client Login' : 'Client Registration'}
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            {isLoginTab 
                                ? 'Log in to access your support tickets, upload error logs, and manage company documents.' 
                                : 'Register to get a unique client account and link requests with your Company ID.'
                            }
                        </p>
                    </div>

                    {/* Alerts */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-2 text-xs md:text-sm"
                            >
                                <AlertCircle size={18} className="shrink-0" />
                                <span className="font-semibold">{error}</span>
                            </motion.div>
                        )}
                        {success && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center gap-2 text-xs md:text-sm"
                            >
                                <CheckCircle size={18} className="shrink-0 text-green-600" />
                                <span className="font-semibold">{success}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Forms */}
                    <AnimatePresence mode="wait">
                        {isLoginTab ? (
                            <motion.form 
                                key="login-form"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onSubmit={handleLoginSubmit} 
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Email Address</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary-medium focus:ring-2 focus:ring-primary-light/20 outline-none transition-all text-sm"
                                            placeholder="you@company.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary-medium focus:ring-2 focus:ring-primary-light/20 outline-none transition-all text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary-medium text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-medium/20 disabled:opacity-50 mt-6"
                                >
                                    {loading ? 'Logging in...' : 'Log In'}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="register-form"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onSubmit={handleRegisterSubmit} 
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Full Name *</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={regName}
                                            onChange={(e) => setRegName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary-medium focus:ring-2 focus:ring-primary-light/20 outline-none transition-all text-sm"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Email Address *</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={regEmail}
                                            onChange={(e) => setRegEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary-medium focus:ring-2 focus:ring-primary-light/20 outline-none transition-all text-sm"
                                            placeholder="john@company.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Password *</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            value={regPassword}
                                            onChange={(e) => setRegPassword(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary-medium focus:ring-2 focus:ring-primary-light/20 outline-none transition-all text-sm"
                                            placeholder="At least 6 characters"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Company ID *</label>
                                        <div className="relative">
                                            <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                value={regCompanyId}
                                                onChange={(e) => setRegCompanyId(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary-medium focus:ring-2 focus:ring-primary-light/20 outline-none transition-all text-sm"
                                                placeholder="e.g. UNI-123"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Phone (Optional)</label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={regPhone}
                                                onChange={(e) => setRegPhone(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-primary-medium focus:ring-2 focus:ring-primary-light/20 outline-none transition-all text-sm"
                                                placeholder="+91 99999 99999"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary-medium text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-medium/20 disabled:opacity-50 mt-6"
                                >
                                    {loading ? 'Creating Account...' : 'Register'}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default ClientPortal;
