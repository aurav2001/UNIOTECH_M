import React, { useState, useEffect } from 'react';
import {
    Users, CheckCircle, XCircle, Clock, Search, RefreshCw,
    AlertCircle, Trash2, Mail, Phone, Building, ExternalLink, ShieldCheck, ShieldAlert, Filter
} from 'lucide-react';
import { apiRequest } from '../../utils/api';

const ClientAccountsManager = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);

    const fetchClients = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiRequest('/api/client/admin/list');
            const data = await res.json();
            if (data.success && Array.isArray(data.clients)) {
                setClients(data.clients);
            } else {
                setError(data.error || 'Failed to load client accounts.');
            }
        } catch (err) {
            setError(err.message || 'Connection error loading clients.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchClients();
    };

    const handleStatusUpdate = async (id, newStatus) => {
        setActionLoading(id);
        setActionMessage(null);
        try {
            const res = await apiRequest(`/api/client/admin/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setClients(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
                setActionMessage({
                    type: 'success',
                    text: `Client account #${id} has been ${newStatus === 'approved' ? 'Approved ✅' : newStatus === 'rejected' ? 'Rejected ❌' : 'updated'}.`
                });
                setTimeout(() => setActionMessage(null), 4000);
            } else {
                setActionMessage({ type: 'error', text: data.error || 'Failed to update status.' });
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: 'Error connecting to server.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to permanently delete client account for "${name}"?`)) return;

        setActionLoading(id);
        try {
            const res = await apiRequest(`/api/client/admin/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setClients(prev => prev.filter(c => c.id !== id));
                setActionMessage({ type: 'success', text: `Client account deleted successfully.` });
                setTimeout(() => setActionMessage(null), 4000);
            } else {
                setActionMessage({ type: 'error', text: data.error || 'Failed to delete account.' });
            }
        } catch (err) {
            setActionMessage({ type: 'error', text: 'Error deleting account.' });
        } finally {
            setActionLoading(null);
        }
    };

    // Filter clients
    const filteredClients = clients.filter(client => {
        const matchesStatus = statusFilter === 'all' || (client.status || 'pending') === statusFilter;
        if (!matchesStatus) return false;

        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            client.name?.toLowerCase().includes(q) ||
            client.email?.toLowerCase().includes(q) ||
            client.companyId?.toLowerCase().includes(q) ||
            client.phone?.includes(q)
        );
    });

    const counts = {
        total: clients.length,
        pending: clients.filter(c => (c.status || 'pending') === 'pending').length,
        approved: clients.filter(c => c.status === 'approved').length,
        rejected: clients.filter(c => c.status === 'rejected').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2.5">
                        <Users className="text-primary-medium" size={26} />
                        Client Accounts & Registration Approvals
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Review new company sign-ups, approve/reject portal access, and oversee client accounts.
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                >
                    <RefreshCw size={16} className={refreshing ? 'animate-spin text-primary-medium' : ''} />
                    Refresh List
                </button>
            </div>

            {/* Notification alert */}
            {actionMessage && (
                <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-center gap-3 transition-all ${
                    actionMessage.type === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                    {actionMessage.type === 'success' ? <CheckCircle size={18} className="text-green-600 shrink-0" /> : <AlertCircle size={18} className="text-red-600 shrink-0" />}
                    <span>{actionMessage.text}</span>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Registered</p>
                        <p className="text-2xl font-black text-gray-900 mt-0.5">{counts.total}</p>
                    </div>
                </div>

                <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 transition-all ${
                    counts.pending > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-gray-200'
                }`}>
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                            Pending Approval
                            {counts.pending > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>}
                        </p>
                        <p className="text-2xl font-black text-amber-600 mt-0.5">{counts.pending}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Approved Active</p>
                        <p className="text-2xl font-black text-green-600 mt-0.5">{counts.approved}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rejected</p>
                        <p className="text-2xl font-black text-red-600 mt-0.5">{counts.rejected}</p>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    {[
                        { id: 'all', label: 'All Accounts', count: counts.total },
                        { id: 'pending', label: 'Pending Approval', count: counts.pending, alert: counts.pending > 0 },
                        { id: 'approved', label: 'Approved', count: counts.approved },
                        { id: 'rejected', label: 'Rejected', count: counts.rejected }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                                statusFilter === tab.id
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-full text-xs font-extrabold ${
                                statusFilter === tab.id
                                    ? 'bg-white/20 text-white'
                                    : tab.alert
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-gray-200 text-gray-700'
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="relative min-w-[240px]">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search client, email, company ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-primary-medium outline-none transition-all"
                    />
                </div>
            </div>

            {/* Clients List Table */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-20 text-center text-gray-400">
                        <RefreshCw size={36} className="animate-spin text-primary-medium mx-auto mb-3" />
                        <p className="text-sm font-bold">Loading client registrations...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center bg-red-50 text-red-700">
                        <AlertCircle size={32} className="mx-auto mb-2 text-red-500" />
                        <p className="font-bold">{error}</p>
                        <button onClick={fetchClients} className="mt-3 text-sm underline font-bold">Try again</button>
                    </div>
                ) : filteredClients.length === 0 ? (
                    <div className="py-16 text-center px-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-3">
                            <Users size={28} />
                        </div>
                        <h4 className="font-bold text-gray-800 text-base">No client accounts found</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            {searchQuery ? 'No accounts matched your search criteria.' : 'When clients register via the Client Portal, they will show up here for your review.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                                <tr>
                                    <th className="px-6 py-4">Client / Company</th>
                                    <th className="px-6 py-4">Contact Info</th>
                                    <th className="px-6 py-4">Registered Date</th>
                                    <th className="px-6 py-4">Tickets Raised</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Approval Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredClients.map((c) => {
                                    const clientStatus = c.status || 'pending';
                                    const isPending = clientStatus === 'pending';
                                    const isApproved = clientStatus === 'approved';
                                    const isRejected = clientStatus === 'rejected';

                                    const dateStr = new Date(c.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    });

                                    return (
                                        <tr key={c.id} className={`hover:bg-gray-50/80 transition-colors ${isPending ? 'bg-amber-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-primary-light/20 text-primary-medium font-black flex items-center justify-center text-sm shrink-0">
                                                        {c.name?.charAt(0)?.toUpperCase() || 'C'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{c.name}</p>
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-primary-medium/10 text-primary-medium uppercase mt-0.5">
                                                            <Building size={11} /> {c.companyId}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <p className="text-gray-900 font-medium text-xs flex items-center gap-1.5">
                                                    <Mail size={13} className="text-gray-400 shrink-0" />
                                                    <a href={`mailto:${c.email}`} className="hover:text-primary-medium hover:underline">{c.email}</a>
                                                </p>
                                                {c.phone && (
                                                    <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-1">
                                                        <Phone size={13} className="text-gray-400 shrink-0" />
                                                        <a href={`tel:${c.phone}`} className="hover:text-primary-medium">{c.phone}</a>
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                                                {dateStr}
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-gray-100 text-gray-800">
                                                    {c.ticketCount || 0} tickets
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {isPending && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                        <Clock size={12} /> Pending Approval
                                                    </span>
                                                )}
                                                {isApproved && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                                        <CheckCircle size={12} /> Approved
                                                    </span>
                                                )}
                                                {isRejected && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                                        <XCircle size={12} /> Rejected
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Approve Button */}
                                                    {!isApproved && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(c.id, 'approved')}
                                                            disabled={actionLoading === c.id}
                                                            className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                            title="Approve Client Account"
                                                        >
                                                            <CheckCircle size={14} /> Approve
                                                        </button>
                                                    )}

                                                    {/* Reject Button */}
                                                    {!isRejected && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(c.id, 'rejected')}
                                                            disabled={actionLoading === c.id}
                                                            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                            title="Reject Client Account"
                                                        >
                                                            <XCircle size={14} /> Reject
                                                        </button>
                                                    )}

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => handleDelete(c.id, c.name)}
                                                        disabled={actionLoading === c.id}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Account"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientAccountsManager;
