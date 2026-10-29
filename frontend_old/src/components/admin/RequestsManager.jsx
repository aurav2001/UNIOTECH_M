import React, { useState, useEffect } from 'react';
import {
    Inbox, Mail, Phone, MessageCircle, Clock, User, MapPin, Tag,
    CheckCircle, Eye, Trash2, RefreshCw, Search, Filter, X,
    ChevronDown, ChevronUp, ExternalLink, AlertCircle, Briefcase, FileText,
    Bell, Zap, XCircle, Send, MessageSquare
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { apiRequest } from '../../utils/api';
import SLATimerBadge from '../SLATimerBadge';

const RequestsManager = () => {
    // const { token } = useAdmin();
    const [activeTab, setActiveTab] = useState('all');
    const [submissions, setSubmissions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [slaFilter, setSlaFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    // const apiUrl = import.meta.env.VITE_API_URL;

    // Tab configuration
    const tabs = [
        { id: 'all', label: 'All Requests', icon: Inbox },
        { id: 'contact', label: 'Contact', icon: Mail },
        { id: 'callback', label: 'Callbacks', icon: Phone },
        { id: 'enquiry', label: 'Enquiries', icon: MessageCircle },
        { id: 'career', label: 'Careers', icon: Briefcase },
        { id: 'ticket', label: 'Tickets', icon: AlertCircle },
    ];

    // Fetch stats
    const fetchStats = async () => {
        try {
            const res = await apiRequest('/api/submissions/stats');
            const data = await res.json();
            setStats(data.stats);
        } catch (err) {
            // Handle error silently
        }
    };

    // Fetch submissions
    const fetchSubmissions = async () => {
        setLoading(true);
        setError(null);
        try {
            let endpoint = '/api/submissions?limit=200';
            if (activeTab !== 'all') {
                endpoint += `&type=${activeTab}`;
            }
            if (statusFilter !== 'all') {
                endpoint += `&status=${statusFilter}`;
            }

            const res = await apiRequest(endpoint);
            const data = await res.json();
            setSubmissions(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchStats();
        fetchSubmissions();
    }, [activeTab, statusFilter]);

    // Refresh handler
    const handleRefresh = () => {
        setRefreshing(true);
        fetchStats();
        fetchSubmissions();
    };

    // Response state
    const [adminResponseText, setAdminResponseText] = useState({});
    const [sendingResponseId, setSendingResponseId] = useState(null);
    const [responseSuccessMsg, setResponseSuccessMsg] = useState({});
    const [expandedIds, setExpandedIds] = useState(new Set());

    // Auto-expand first submission when loaded
    useEffect(() => {
        if (submissions.length > 0 && expandedIds.size === 0) {
            setExpandedIds(new Set([submissions[0].id]));
        }
    }, [submissions]);

    const toggleExpand = (id) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const expandAll = () => {
        setExpandedIds(new Set(filteredSubmissions.map(s => s.id)));
    };

    const collapseAll = () => {
        setExpandedIds(new Set());
    };

    const [updatingStatusMap, setUpdatingStatusMap] = useState({});

    // Update status with instant optimistic UI update (0ms lag)
    const updateStatus = async (id, newStatus) => {
        const prevSubmissions = submissions;
        const isResolved = newStatus === 'resolved' || newStatus === 'closed';

        // 1. Instant local state update
        setUpdatingStatusMap(prev => ({ ...prev, [id]: newStatus }));
        setSubmissions(prev =>
            prev.map(s => s.id === id ? { 
                ...s, 
                status: newStatus,
                resolvedAt: isResolved ? new Date() : (newStatus === 'in_progress' || newStatus === 'approved' ? null : s.resolvedAt),
                slaBreached: isResolved && s.slaDeadline ? new Date() > new Date(s.slaDeadline) : s.slaBreached
            } : s)
        );

        // 2. Background API persistence
        try {
            const res = await apiRequest(`/api/submissions/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const data = await res.json();
                const updated = data.data || { status: newStatus };
                setSubmissions(prev =>
                    prev.map(s => s.id === id ? { ...s, ...updated } : s)
                );
                setSelectedSubmission(prev => (prev && prev.id === id ? { ...prev, ...updated } : prev));
                fetchStats();
            } else {
                setSubmissions(prevSubmissions);
            }
        } catch (err) {
            console.error('Failed to update status:', err);
            setSubmissions(prevSubmissions);
        } finally {
            setUpdatingStatusMap(prev => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        }
    };

    // Send admin response and email client
    const handleSendAdminResponse = async (id, customText = null, statusOverride = null) => {
        const responseText = typeof customText === 'string' ? customText : adminResponseText[id];
        if (!responseText && !statusOverride) return;

        setSendingResponseId(id);
        try {
            const bodyPayload = {};
            if (responseText) bodyPayload.adminResponse = responseText;
            if (statusOverride) bodyPayload.status = statusOverride;

            const res = await apiRequest(`/api/submissions/${id}`, {
                method: 'PUT',
                body: JSON.stringify(bodyPayload)
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const updated = data.data;
                setSubmissions(prev =>
                    prev.map(s => s.id === id ? { ...s, ...updated } : s)
                );
                setSelectedSubmission(prev => (prev && prev.id === id ? { ...prev, ...updated } : prev));
                setResponseSuccessMsg(prev => ({ ...prev, [id]: 'Response saved & emailed to client successfully!' }));
                setTimeout(() => {
                    setResponseSuccessMsg(prev => ({ ...prev, [id]: '' }));
                }, 4000);
            }
        } catch (err) {
            console.error('Failed to send admin response:', err);
        } finally {
            setSendingResponseId(null);
        }
    };

    // Delete submission
    const deleteSubmission = async (id) => {
        if (!confirm('Are you sure you want to delete this submission?')) return;

        try {
            const res = await apiRequest(`/api/submissions/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setSubmissions(prev => prev.filter(s => s.id !== id));
                setSelectedSubmission(null);
                fetchStats();
            }
        } catch (err) {
            // Handle error silently
        }
    };

    // Filter submissions by search, priority, and SLA
    const filteredSubmissions = submissions.filter(s => {
        if (priorityFilter !== 'all') {
            const itemPriority = s.priority || 'medium';
            if (itemPriority !== priorityFilter) return false;
        }

        if (slaFilter !== 'all' && s.type === 'ticket') {
            const priority = (s.priority || 'medium').toLowerCase();
            const targetHours = { urgent: 2, high: 6, medium: 24, low: 48 }[priority] || 24;
            const createdAt = new Date(s.createdAt).getTime();
            const deadline = s.slaDeadline ? new Date(s.slaDeadline).getTime() : createdAt + (targetHours * 3600000);
            const isResolved = s.status === 'resolved' || s.status === 'closed' || s.status === 'rejected';
            const now = Date.now();
            const rem = deadline - now;

            if (slaFilter === 'breached') {
                if (isResolved) {
                    const resAt = s.resolvedAt ? new Date(s.resolvedAt).getTime() : (s.updatedAt ? new Date(s.updatedAt).getTime() : now);
                    if (resAt <= deadline) return false;
                } else {
                    if (rem > 0) return false;
                }
            } else if (slaFilter === 'at_risk') {
                if (isResolved || rem <= 0 || rem > 3600000) return false;
            } else if (slaFilter === 'on_track') {
                if (!isResolved && (rem <= 0 || rem <= 3600000)) return false;
            }
        }

        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            s.name?.toLowerCase().includes(query) ||
            s.email?.toLowerCase().includes(query) ||
            s.phone?.includes(query) ||
            s.subject?.toLowerCase().includes(query) ||
            s.source?.toLowerCase().includes(query) ||
            s.companyId?.toLowerCase().includes(query) ||
            s.priority?.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Form Submissions</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage all contact forms, callback requests, enquiries, and support tickets
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-100">

                        <div className="flex items-center justify-between mb-2">
                            <Mail className="text-purple-500" size={20} />
                            {stats.contact.new > 0 && (
                                <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {stats.contact.new} new
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.contact.total}</p>
                        <p className="text-xs text-gray-500">Contact Forms</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <Phone className="text-orange-500" size={20} />
                            {stats.callback.new > 0 && (
                                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {stats.callback.new} new
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.callback.total}</p>
                        <p className="text-xs text-gray-500">Callbacks</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <MessageCircle className="text-teal-500" size={20} />
                            {stats.enquiry.new > 0 && (
                                <span className="bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {stats.enquiry.new} new
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.enquiry.total}</p>
                        <p className="text-xs text-gray-500">Enquiries</p>
                    </div>
                    {stats.career && (
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <Briefcase className="text-blue-500" size={20} />
                                {stats.career.new > 0 && (
                                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {stats.career.new} new
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.career.total}</p>
                            <p className="text-xs text-gray-500">Applications</p>
                        </div>
                    )}
                    {stats.ticket && (
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <AlertCircle className="text-red-500" size={20} />
                                {stats.ticket.new > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        {stats.ticket.new} new
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{stats.ticket.total}</p>
                            <p className="text-xs text-gray-500">Tickets</p>
                        </div>
                    )}
                    <div className="bg-gradient-to-br from-primary-dark to-primary-medium rounded-xl p-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Inbox size={20} />
                            {stats.totalNew > 0 && (
                                <span className="bg-white/20 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {stats.totalNew} unread
                                </span>
                            )}
                        </div>
                        <p className="text-2xl font-bold">
                            {stats.contact.total + stats.callback.total + stats.enquiry.total + (stats.career?.total || 0) + (stats.ticket?.total || 0)}
                        </p>
                        <p className="text-xs text-white/70">Total Submissions</p>
                    </div>
                </div>
            )}

            {/* Tabs & Filters */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const newCount = stats ? (
                                tab.id === 'all' ? stats.totalNew :
                                    tab.id === 'contact' ? stats.contact?.new || 0 :
                                        tab.id === 'callback' ? stats.callback?.new || 0 :
                                            tab.id === 'enquiry' ? stats.enquiry?.new || 0 :
                                                tab.id === 'career' ? stats.career?.new || 0 :
                                                    tab.id === 'ticket' ? stats.ticket?.new || 0 : 0
                            ) : 0;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${isActive
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                    {newCount > 0 && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-blue-500 text-white'
                                            }`}>
                                            {newCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search submissions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-medium w-48"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-medium"
                        >
                            <option value="all">All Statuses</option>
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="approved">Approved</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="rejected">Rejected</option>
                            <option value="closed">Closed</option>
                        </select>
                        {(activeTab === 'all' || activeTab === 'ticket') && (
                            <>
                                <select
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary-medium"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                    <option value="urgent">Urgent / Critical</option>
                                </select>

                                <select
                                    value={slaFilter}
                                    onChange={(e) => setSlaFilter(e.target.value)}
                                    className={`px-3 py-2 rounded-lg border text-sm font-bold focus:outline-none transition-colors ${
                                        slaFilter === 'breached' 
                                            ? 'bg-red-50 text-red-700 border-red-300' 
                                            : slaFilter === 'at_risk' 
                                                ? 'bg-amber-50 text-amber-800 border-amber-300' 
                                                : 'bg-white border-gray-200 text-gray-700 focus:border-primary-medium'
                                    }`}
                                >
                                    <option value="all">⏱️ All SLA Statuses</option>
                                    <option value="breached">🚨 SLA Breached Only</option>
                                    <option value="at_risk">⚠️ SLA At Risk (&lt; 1h)</option>
                                    <option value="on_track">⏳ SLA On Track</option>
                                </select>
                            </>
                        )}
                        {filteredSubmissions.length > 0 && (
                            <div className="flex items-center gap-1.5 ml-auto">
                                <button
                                    type="button"
                                    onClick={expandAll}
                                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-all"
                                >
                                    Expand All
                                </button>
                                <button
                                    type="button"
                                    onClick={collapseAll}
                                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-all"
                                >
                                    Collapse All
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submissions List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12">
                        <RefreshCw className="animate-spin mx-auto text-gray-400 mb-3" size={32} />
                        <p className="text-gray-500">Loading submissions...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-red-50 rounded-xl">
                        <AlertCircle className="mx-auto text-red-400 mb-3" size={32} />
                        <p className="text-red-600 font-medium">{error}</p>
                        <button
                            onClick={handleRefresh}
                            className="mt-3 text-sm text-red-500"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredSubmissions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                        <Inbox className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500 font-medium">No submissions found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {searchQuery ? 'Try a different search term' : 'Submissions will appear here when users fill out forms'}
                        </p>
                    </div>
                ) : (
                    filteredSubmissions.map(submission => (
                        <SubmissionCard
                            key={submission.id}
                            submission={submission}
                            isExpanded={expandedIds.has(submission.id)}
                            onToggleExpand={() => {
                                toggleExpand(submission.id);
                                if (submission.status === 'new') {
                                    updateStatus(submission.id, 'read');
                                }
                            }}
                            onUpdateStatus={updateStatus}
                            updatingStatusVal={updatingStatusMap[submission.id]}
                            onDelete={deleteSubmission}
                            onSendResponse={handleSendAdminResponse}
                            isSendingResponse={sendingResponseId === submission.id}
                            successMsg={responseSuccessMsg[submission.id]}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// --- Helper Functions & Badges (Defined outside to prevent React re-mount on keystroke) ---

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const StatusBadge = ({ status }) => {
    const config = {
        new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New / Under Review' },
        read: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Read' },
        approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Approved' },
        in_progress: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'In Progress' },
        resolved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Resolved' },
        rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
        closed: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Closed' }
    };
    const c = config[status] || config.new;
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
            {c.label}
        </span>
    );
};

const PriorityBadge = ({ priority }) => {
    const config = {
        low: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', label: 'Low' },
        medium: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Medium' },
        high: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'High Priority' },
        urgent: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Urgent / Critical', pulse: true }
    };
    const p = config[priority?.toLowerCase()] || config.medium;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${p.bg} ${p.text} ${p.border}`}>
            <Zap size={11} className={p.pulse ? 'animate-bounce text-red-600' : ''} />
            {p.label}
        </span>
    );
};

const TypeBadge = ({ type }) => {
    const config = {
        contact: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Mail },
        callback: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Phone },
        enquiry: { bg: 'bg-teal-100', text: 'text-teal-700', icon: MessageCircle },
        career: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Briefcase },
        ticket: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle }
    };
    const c = config[type] || config.contact;
    const Icon = c.icon;
    return (
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
            <Icon size={12} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
    );
};

// SubmissionCard component with local state to keep input responsive and focused
const SubmissionCard = ({
    submission,
    isExpanded,
    onToggleExpand,
    onUpdateStatus,
    updatingStatusVal,
    onDelete,
    onSendResponse,
    isSendingResponse,
    successMsg
}) => {
    const isTicket = submission.type === 'ticket';
    const hasReminders = submission.remindersCount > 0;
    const [localResponse, setLocalResponse] = useState(submission.adminResponse || '');

    useEffect(() => {
        setLocalResponse(submission.adminResponse || '');
    }, [submission.adminResponse]);

    return (
        <div
            className={`bg-white rounded-xl border transition-all ${isExpanded
                ? 'border-primary-medium shadow-lg'
                : hasReminders
                    ? 'border-amber-400 bg-amber-50/10 shadow-sm hover:shadow-md'
                    : submission.status === 'new'
                        ? 'border-blue-200 shadow-sm hover:shadow-md'
                        : 'border-gray-100 hover:border-gray-200'
                }`}
        >
            {/* Header - Clickable area to expand/collapse */}
            <div
                className="p-4 flex items-start justify-between gap-4 cursor-pointer select-none"
                onClick={onToggleExpand}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <TypeBadge type={submission.type} />
                        <StatusBadge status={submission.status} />
                        {isTicket && (
                            <>
                                <PriorityBadge priority={submission.priority} />
                                <SLATimerBadge ticket={submission} compact={true} showTarget={true} />
                            </>
                        )}
                        {hasReminders && (
                            <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-sm animate-pulse">
                                <Bell size={10} /> {submission.remindersCount} Client {submission.remindersCount === 1 ? 'Reminder' : 'Reminders'}
                            </span>
                        )}
                        {submission.companyId && (
                            <span className="bg-primary-light/35 text-primary-medium px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 shadow-sm">
                                🏢 {submission.companyId}
                            </span>
                        )}
                        {submission.source && submission.source !== 'General Enquiry' && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Tag size={10} />
                                {submission.source}
                            </span>
                        )}
                    </div>
                    <h4 className="font-bold text-gray-900 truncate">{submission.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        {submission.email && (
                            <span className="flex items-center gap-1 truncate">
                                <Mail size={12} />
                                {submission.email}
                            </span>
                        )}
                        {submission.phone && (
                            <span className="flex items-center gap-1">
                                <Phone size={12} />
                                {submission.phone}
                            </span>
                        )}
                        {submission.subject && (
                            <span className="text-gray-400 truncate">
                                • {submission.subject}
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end justify-between gap-2 self-stretch">
                    <p className="text-xs text-gray-400 font-medium">{formatDate(submission.createdAt)}</p>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand();
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                            isExpanded
                                ? 'bg-gray-800 text-white hover:bg-gray-900'
                                : 'bg-primary-medium text-white hover:bg-primary-dark ring-2 ring-primary-medium/20'
                        }`}
                    >
                        <MessageSquare size={13} />
                        <span>{isExpanded ? 'Hide Details' : 'Reply / View'}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div
                    className="border-t border-gray-100"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-4 pb-4 pt-4">
                        {/* Client Reminder Warning Banner */}
                        {hasReminders && (
                            <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Bell className="text-amber-600 animate-bounce shrink-0" size={16} />
                                    <span>Client sent <strong>{submission.remindersCount} {submission.remindersCount === 1 ? 'reminder' : 'reminders'}</strong> requesting an update on this ticket.</span>
                                </div>
                                {submission.lastRemindedAt && (
                                    <span className="text-[10px] text-amber-800 bg-white px-2.5 py-1 rounded-full border border-amber-200 self-start sm:self-auto shrink-0">
                                        Last Nudge: {new Date(submission.lastRemindedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} ({formatDate(submission.lastRemindedAt)})
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Full Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Full Name</p>
                                <p className="text-sm font-medium text-gray-900">{submission.name}</p>
                            </div>
                            {submission.email && (
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Email</p>
                                    <a href={`mailto:${submission.email}`} className="text-sm font-medium text-primary-medium flex items-center gap-1">
                                        {submission.email}
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                            )}
                            {submission.phone && (
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Phone</p>
                                    <a href={`tel:${submission.phone}`} className="text-sm font-medium text-primary-medium flex items-center gap-1">
                                        {submission.phone}
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                            )}
                            {submission.subject && (
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Subject</p>
                                    <p className="text-sm font-medium text-gray-900">{submission.subject}</p>
                                </div>
                            )}
                            {isTicket && (
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Ticket Priority</p>
                                    <div className="mt-0.5">
                                        <PriorityBadge priority={submission.priority} />
                                    </div>
                                </div>
                            )}
                            {submission.companyId && (
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Company ID</p>
                                    <p className="text-sm font-extrabold text-primary-medium uppercase">{submission.companyId}</p>
                                </div>
                            )}
                            {submission.preferredTime && (
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Preferred Time</p>
                                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                        <Clock size={14} className="text-orange-500" />
                                        {submission.preferredTime}
                                    </p>
                                </div>
                            )}
                            {submission.source && (
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Enquiry Source</p>
                                    <p className="text-sm font-medium text-gray-900">{submission.source}</p>
                                </div>
                            )}

                            {submission.cvUrl && (
                                <div className="col-span-full">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-2">Attached CV</p>
                                    <a
                                        href={submission.cvUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium text-sm hover:bg-blue-100 transition-colors border border-blue-200"
                                    >
                                        <FileText size={16} />
                                        View Resume / CV
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Message */}
                        {submission.message && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-400 font-bold uppercase mb-1">Message</p>
                                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                                    {submission.message.includes('CV:') ? (
                                        <>
                                            {submission.message.split('\n').map((line, idx) => {
                                                if (line.startsWith('CV:') || line.includes('CV:')) {
                                                    let cvUrl = line.replace('CV:', '').trim();
                                                    if (cvUrl && (cvUrl.startsWith('http://') || cvUrl.startsWith('https://'))) {
                                                        let downloadUrl = cvUrl;
                                                        if (cvUrl.includes('cloudinary.com')) {
                                                            downloadUrl = cvUrl.replace('/upload/', '/upload/fl_attachment/');
                                                        }
                                                        return (
                                                            <div key={idx} className="mt-3 flex flex-wrap gap-2">
                                                                <a
                                                                    href={cvUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
                                                                >
                                                                    <FileText size={16} />
                                                                    View Resume
                                                                    <ExternalLink size={14} />
                                                                </a>
                                                                <a
                                                                    href={downloadUrl}
                                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium text-sm hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
                                                                >
                                                                    <FileText size={16} />
                                                                    Download CV
                                                                </a>
                                                            </div>
                                                        );
                                                    }
                                                    return <div key={idx}>{line}</div>;
                                                }
                                                return <div key={idx}>{line}</div>;
                                            })}
                                        </>
                                    ) : (
                                        submission.message
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Attached Files & Screenshots (Tickets or Enquiries) */}
                        {submission.attachments && (
                            (() => {
                                let attList = [];
                                try {
                                    attList = Array.isArray(submission.attachments) 
                                        ? submission.attachments 
                                        : JSON.parse(submission.attachments);
                                } catch(e) { attList = []; }

                                if (!Array.isArray(attList) || attList.length === 0) return null;

                                return (
                                    <div className="mb-4 p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200">
                                        <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                            📎 Attached Files / Screenshots ({attList.length}):
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {attList.map((att, aIdx) => (
                                                <a
                                                    key={aIdx}
                                                    href={att.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    download={att.name}
                                                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-blue-200 rounded-xl text-xs font-bold text-gray-800 hover:text-primary-medium hover:border-primary-medium transition-all shadow-xs group"
                                                >
                                                    <FileText size={14} className="text-primary-medium" />
                                                    <span className="max-w-[200px] truncate">{att.name || 'Attachment'}</span>
                                                    {att.size && <span className="text-[10px] text-gray-400 font-normal">({Math.round(att.size / 1024)} KB)</span>}
                                                    <ExternalLink size={12} className="text-gray-400 group-hover:text-primary-medium ml-1" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()
                        )}

                        {/* Quick Action Buttons */}
                        <div className="mb-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                                {isTicket ? 'Quick Ticket Status Actions:' : 'Quick Status Actions:'}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => onUpdateStatus(submission.id, 'approved')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                                        submission.status === 'approved' 
                                            ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/30' 
                                            : 'bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                                    }`}
                                >
                                    {updatingStatusVal === 'approved' ? <RefreshCw size={14} className="animate-spin text-emerald-700" /> : <CheckCircle size={14} />}
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onUpdateStatus(submission.id, 'in_progress')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                                        submission.status === 'in_progress' 
                                            ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/30' 
                                            : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-50'
                                    }`}
                                >
                                    {updatingStatusVal === 'in_progress' ? <RefreshCw size={14} className="animate-spin text-amber-700" /> : <Clock size={14} />}
                                    In Progress
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onUpdateStatus(submission.id, 'resolved')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                                        submission.status === 'resolved' 
                                            ? 'bg-green-600 text-white shadow-sm ring-2 ring-green-400/30' 
                                            : 'bg-white border border-green-300 text-green-700 hover:bg-green-50'
                                    }`}
                                >
                                    {updatingStatusVal === 'resolved' ? <RefreshCw size={14} className="animate-spin text-green-700" /> : <CheckCircle size={14} />}
                                    Mark Resolved
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onUpdateStatus(submission.id, 'rejected')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                                        submission.status === 'rejected' 
                                            ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-400/30' 
                                            : 'bg-white border border-red-300 text-red-700 hover:bg-red-50'
                                    }`}
                                >
                                    {updatingStatusVal === 'rejected' ? <RefreshCw size={14} className="animate-spin text-red-700" /> : <XCircle size={14} />}
                                    Reject
                                </button>
                            </div>
                        </div>

                        {/* Official Admin Response / Reply Form (Available on all submissions) */}
                        <div className="mb-4 p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-blue-200 rounded-2xl">
                            {submission.adminResponse && (
                                <div className="mb-3 p-3 bg-white border border-blue-200 rounded-xl shadow-xs">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-bold text-blue-900 uppercase flex items-center gap-1">
                                            💬 Current Admin Response {submission.email ? '(Emailed to Client)' : ''}
                                        </span>
                                        {submission.respondedAt && (
                                            <span className="text-[10px] text-blue-600 font-medium">
                                                Sent: {new Date(submission.respondedAt).toLocaleString('en-IN')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{submission.adminResponse}</p>
                                </div>
                            )}

                            <label className="block text-xs font-bold text-blue-950 uppercase tracking-wider mb-1.5">
                                ✉️ {submission.adminResponse ? 'Update Official Response to User' : 'Post Official Response & Solution'}
                            </label>
                            <textarea
                                rows="3"
                                value={localResponse}
                                onChange={(e) => setLocalResponse(e.target.value)}
                                placeholder="Type resolution steps, engineer remarks, or instructions. This will be recorded and emailed to the user..."
                                className="w-full p-3 text-sm bg-white border border-blue-200 rounded-xl focus:border-primary-medium focus:ring-2 focus:ring-primary-light/30 outline-none resize-none transition-all"
                            ></textarea>

                            {successMsg && (
                                <div className="mt-2 p-2 bg-green-100 border border-green-200 text-green-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                    <CheckCircle size={14} className="text-green-600 shrink-0" />
                                    <span>{successMsg}</span>
                                </div>
                            )}

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={isSendingResponse}
                                        onClick={() => onSendResponse(submission.id, localResponse)}
                                        className="px-4 py-2 bg-primary-medium hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        <Send size={13} className={isSendingResponse ? 'animate-spin' : ''} />
                                        {isSendingResponse ? 'Sending...' : 'Send Response & Email User'}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isSendingResponse}
                                        onClick={() => onSendResponse(submission.id, localResponse, 'resolved')}
                                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                        <CheckCircle size={13} /> Send & Mark Resolved
                                    </button>
                                </div>
                                <span className="text-[11px] text-gray-500 italic">
                                    {submission.email ? 'User will receive an instant email notification' : 'Response will be saved to record'}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Change Status:</span>
                                <select
                                    value={submission.status}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        onUpdateStatus(submission.id, e.target.value);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-primary-medium"
                                >
                                    <option value="new">New</option>
                                    <option value="read">Read</option>
                                    <option value="approved">Approved</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(submission.id);
                                }}
                                className="flex items-center gap-1 text-sm text-red-500 font-medium hover:text-red-700 transition-colors"
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>

                        {/* Metadata */}
                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                            <p>Submitted: {new Date(submission.createdAt).toLocaleString('en-IN')}</p>
                            {submission.ipAddress && <p>IP: {submission.ipAddress}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestsManager;
