import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Mail, Clock, Send, MessageCircle, ArrowRight, Check, AlertCircle, Phone, LifeBuoy, UploadCloud, Paperclip, File, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { validateTicketForm, isRequired, isValidEmail } from '../utils/validation';
import { getApiUrl } from '../utils/api';
import { useClient } from '../context/ClientContext';
import { useContent } from '../context/ContentContext';
import { Link } from 'react-router-dom';

const SLAItem = ({ title, desc, time, type }) => {
    const bgColors = {
        high: 'bg-red-50 border-red-100 text-red-700',
        medium: 'bg-orange-50 border-orange-100 text-orange-700',
        normal: 'bg-blue-50 border-blue-100 text-blue-700'
    };

    return (
        <div className={`p-6 rounded-2xl border ${bgColors[type] || bgColors.normal} flex items-start gap-4 shadow-sm`}>
            <div className="p-3 bg-white rounded-xl shadow-sm shrink-0">
                <Clock size={20} className="text-gray-700" />
            </div>
            <div>
                <h4 className="font-bold text-gray-900 text-sm md:text-base">{title}</h4>
                <p className="text-gray-500 text-xs md:text-sm mt-1">{desc}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-full text-xs font-bold shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    SLA: {time}
                </div>
            </div>
        </div>
    );
};

const Support = () => {
    const [searchParams] = useSearchParams();
    const { isAuthenticated, client } = useClient();
    const { getContent } = useContent();
    const [selectedFaqIndex, setSelectedFaqIndex] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        priority: 'medium'
    });
    const [status, setStatus] = useState({ loading: false, success: false, error: '', ticketId: null });
    const [fieldErrors, setFieldErrors] = useState({});
    const [attachments, setAttachments] = useState([]);
    const [uploadingFiles, setUploadingFiles] = useState(false);

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingFiles(true);
        try {
            const formData = new FormData();
            Array.from(files).forEach(f => formData.append('files', f));

            const res = await fetch(getApiUrl('/api/upload/ticket-attachment'), {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const uploadedList = data.files || (data.file ? [data.file] : []);
                setAttachments(prev => [...prev, ...uploadedList]);
            } else {
                alert(data.error || 'Failed to upload attachment');
            }
        } catch (err) {
            alert('Upload error: ' + err.message);
        } finally {
            setUploadingFiles(false);
            e.target.value = '';
        }
    };

    const handleRemoveAttachment = (idx) => {
        setAttachments(prev => prev.filter((_, i) => i !== idx));
    };

    const faqData = getContent('supportFaqs') || { title: '', subtitle: '', items: [] };

    // Fallback support subjects in case dynamic content is not loaded or set up yet
    const fallbackFaqs = [
        { question: 'VPN Connection Issues', answer: 'Make sure your internet is working. Open Cisco AnyConnect, enter vpn.uniotechit.com, and use your credential + OTP. If it fails, restart your router.' },
        { question: 'Email/Office 365 Password Reset', answer: 'For password resets, contact your company admin or call/WhatsApp our helpline at +91 98737 37020 for quick verification.' },
        { question: 'Printer Offline / Printing Error', answer: 'Check if the printer is powered on and connected to the network. Restart the Print Spooler service on your PC: search for "Services", find "Print Spooler", and click Restart.' },
        { question: 'Server / ERP Down', answer: 'Verify if other colleagues are facing the same issue. If it is a widespread outage, please raise this ticket immediately, our network operations center is on standby.' },
        { question: 'Software License Request', answer: 'Specify the software name (e.g. Adobe Creative Cloud, Office 365) and the number of licenses required in the detailed description.' }
    ];

    const faqItems = (faqData && Array.isArray(faqData.items) && faqData.items.length > 0) ? faqData.items : fallbackFaqs;

    // Pre-fill email from URL if present, or from logged-in client details
    useEffect(() => {
        if (isAuthenticated && client) {
            setFormData(prev => ({
                ...prev,
                name: client.name || '',
                email: client.email || ''
            }));
        } else {
            const emailParam = searchParams.get('email');
            if (emailParam && isValidEmail(emailParam)) {
                setFormData(prev => ({ ...prev, email: emailParam }));
            }
        }
    }, [searchParams, isAuthenticated, client]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client side validation
        const validation = validateTicketForm(formData);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            return;
        }

        setFieldErrors({});
        setStatus({ loading: true, success: false, error: '', ticketId: null });

        try {
            const token = localStorage.getItem('client_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(getApiUrl('/api/ticket'), {
                method: 'POST',
                headers,
                body: JSON.stringify({ ...formData, attachments })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setStatus({
                    loading: false,
                    success: true,
                    error: '',
                    ticketId: data.submissionId
                });
                setFormData({ name: '', email: '', subject: '', message: '', priority: 'medium' });
                setAttachments([]);
                setSelectedFaqIndex('');
            } else {
                const errorMsg = data.error || (data.errors ? Object.values(data.errors).join(', ') : 'Failed to submit support ticket. Please check all fields.');
                if (data.errors) setFieldErrors(data.errors);
                setStatus({
                    loading: false,
                    success: false,
                    error: errorMsg,
                    ticketId: null
                });
            }
        } catch (error) {
            setStatus({
                loading: false,
                success: false,
                error: 'Connection error. Please check your internet and try again.',
                ticketId: null
            });
        }
    };

    return (
        <div className="bg-white min-h-screen font-sans pt-24 md:pt-32 pb-20 overflow-x-hidden">
            <SEO
                title="Support Helpdesk | UnioTech IT Solutions"
                description="Raise a technical support ticket with UnioTech IT Solutions. Our helpdesk team is dedicated to resolving hardware, software, and networking issues promptly."
                keywords="UnioTech Support, Helpdesk Ticket, Technical Support, Raise Ticket, IT Support"
                url="https://uniotechit.com/support"
            />

            {/* --- HEADER --- */}
            <div className="container mx-auto px-6 md:px-12 lg:px-20 text-center mb-16">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-primary-medium font-bold tracking-widest uppercase text-xs md:text-sm flex items-center justify-center gap-2"
                >
                    <LifeBuoy size={16} className="animate-spin-slow" />
                    Help & Support
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-bold text-gray-900 mt-3 md:mt-4"
                >
                    Raise a Support Ticket
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg leading-relaxed"
                >
                    Experiencing technical issues? Fill out the form below to open a ticket. Our engineering team will review it and get back to you as soon as possible.
                </motion.p>
            </div>

            {/* --- MAIN LAYOUT GRID --- */}
            <div className="container mx-auto px-6 md:px-12 lg:px-20 mb-12">
                <div className="grid lg:grid-cols-12 gap-12 items-start">
                    
                    {/* --- LEFT SIDEBAR: SLAs & HELPLINES (5 cols) --- */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-1 bg-primary-medium rounded-full"></span>
                                Support Timelines
                            </h3>

                            <div className="space-y-4">
                                <SLAItem
                                    type="high"
                                    title="Critical Service Down"
                                    desc="Server crashes, security breaches, network-wide downtime."
                                    time="Within 2 Hours"
                                />
                                <SLAItem
                                    type="medium"
                                    title="Standard Technical Issue"
                                    desc="Software errors, printer problems, single user workstation issues."
                                    time="Within 4 - 8 Hours"
                                />
                                <SLAItem
                                    type="normal"
                                    title="General Support / Request"
                                    desc="Account creation, updates, service query, upgrades."
                                    time="Within 24 Hours"
                                />
                            </div>
                        </div>

                        {/* Direct WhatsApp Call out */}
                        <motion.a
                            href="https://wa.me/919873737020"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-4 p-5 rounded-2xl bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm">
                                <MessageCircle size={24} className="fill-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-green-50 text-xs font-bold uppercase tracking-wider mb-0.5">Urgent Escalation</p>
                                <p className="text-lg font-bold">Chat on WhatsApp</p>
                            </div>
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </motion.a>

                        {/* Quick Contact Cards */}
                        <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm min-w-0">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                                    <Mail size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Email Helpdesk</p>
                                    <p className="text-xs font-bold text-gray-900 mt-0.5 break-all animate-none">support@uniotechit.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm min-w-0">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                                    <Phone size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Helpline</p>
                                    <p className="text-xs font-bold text-gray-900 mt-0.5 break-all animate-none">+91 98737 37020</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT SIDEBAR: TICKET FORM (7 cols) --- */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="bg-gray-50 p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm"
                        >
                            <AnimatePresence mode="wait">
                                {status.success ? (
                                    <motion.div
                                        key="success-state"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="text-center py-10 space-y-6"
                                    >
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-inner">
                                            <Check size={40} className="stroke-[3]" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-gray-900">Ticket Created Successfully!</h3>
                                            <p className="text-gray-500 mt-2 max-w-md mx-auto">
                                                We have registered your issue. A confirmation email has been sent to you with instructions and details.
                                            </p>
                                        </div>

                                        {status.ticketId && (
                                            <div className="inline-block bg-white border border-gray-200 px-6 py-3 rounded-2xl shadow-sm">
                                                <p className="text-xs text-gray-400 font-bold uppercase">Your Ticket ID</p>
                                                <p className="text-xl font-black text-primary-medium mt-1">#{status.ticketId}</p>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center justify-center gap-3">
                                            <Link
                                                to="/client-portal"
                                                className="px-6 py-3 bg-primary-medium hover:bg-primary-dark text-white rounded-xl font-bold shadow-md transition-colors text-sm flex items-center gap-2"
                                            >
                                                View All My Tickets in Portal <ArrowRight size={16} />
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setStatus({ loading: false, success: false, error: '', ticketId: null });
                                                    setSelectedFaqIndex('');
                                                }}
                                                className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl font-bold transition-colors text-sm"
                                            >
                                                Create Another Ticket
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="form-state">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                                <Ticket size={24} className="text-primary-medium" />
                                                Support Request
                                            </h3>
                                        </div>

                                        {status.error && (
                                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-2 text-sm">
                                                <AlertCircle size={20} className="shrink-0" />
                                                <span className="font-semibold">{status.error}</span>
                                            </div>
                                        )}

                                        {/* Client Auth Status Alert */}
                                        {isAuthenticated && client ? (
                                            <div className="mb-6 p-4 bg-primary-light/20 border border-primary-medium/20 text-primary-medium rounded-2xl flex items-center gap-2.5 text-xs md:text-sm">
                                                <Check size={18} className="stroke-[3] bg-primary-medium text-white rounded-full p-0.5 shrink-0" />
                                                <span>Logged in as <strong>{client.name}</strong>. Ticket auto-linked to Company ID: <strong className="uppercase">{client.companyId}</strong>.</span>
                                            </div>
                                        ) : (
                                            <div className="mb-6 p-4 bg-gray-100 border border-gray-200 text-gray-600 rounded-2xl flex items-center gap-2.5 text-xs md:text-sm">
                                                <AlertCircle size={18} className="text-gray-500 shrink-0" />
                                                <span>Registered client? <Link to="/client-portal" className="text-primary-medium font-bold hover:underline">Log in here</Link> to auto-link your ticket to your Company ID.</span>
                                            </div>
                                        )}

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Name *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.name}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, name: e.target.value });
                                                            if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
                                                        }}
                                                        className={`w-full px-4 py-3 rounded-xl bg-white border ${fieldErrors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'} focus:ring-2 focus:ring-primary-light/20 outline-none transition-all text-sm`}
                                                        placeholder="Enter your full name"
                                                    />
                                                    {fieldErrors.name && (
                                                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                                            <AlertCircle size={12} /> {fieldErrors.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={formData.email}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, email: e.target.value });
                                                            if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                                                        }}
                                                        className={`w-full px-4 py-3 rounded-xl bg-white border ${fieldErrors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'} focus:ring-2 focus:ring-primary-light/20 outline-none transition-all text-sm`}
                                                        placeholder="you@company.com"
                                                    />
                                                    {fieldErrors.email && (
                                                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                                            <AlertCircle size={12} /> {fieldErrors.email}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {isAuthenticated && client && (
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Company ID (Auto-Linked)</label>
                                                    <input
                                                        type="text"
                                                        value={client.companyId}
                                                        readOnly
                                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-semibold outline-none text-sm uppercase"
                                                    />
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-2">Subject / Issue Summary *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.subject}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, subject: e.target.value });
                                                            if (fieldErrors.subject) setFieldErrors(prev => ({ ...prev, subject: '' }));
                                                        }}
                                                        className={`w-full px-4 py-3 rounded-xl bg-white border ${fieldErrors.subject ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'} focus:ring-2 focus:ring-primary-light/20 outline-none transition-all text-sm`}
                                                        placeholder="e.g. Cannot connect to VPN, Server Error in ERP, Outlook Sync"
                                                    />
                                                    {fieldErrors.subject && (
                                                        <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                                            <AlertCircle size={12} /> {fieldErrors.subject}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Quick Category / FAQ Selection */}
                                                <div>
                                                    <span className="text-xs text-gray-400 block mb-1.5">Or choose common topic:</span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {faqItems.map((item, index) => (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedFaqIndex(index.toString());
                                                                    setFormData(prev => ({ ...prev, subject: item.question }));
                                                                    if (fieldErrors.subject) setFieldErrors(prev => ({ ...prev, subject: '' }));
                                                                }}
                                                                className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                                                                    formData.subject === item.question
                                                                        ? 'bg-primary-medium text-white border-primary-medium font-semibold'
                                                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                                }`}
                                                            >
                                                                {item.question}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <AnimatePresence initial={false}>
                                                    {selectedFaqIndex !== '' && faqItems[parseInt(selectedFaqIndex, 10)] && formData.subject === faqItems[parseInt(selectedFaqIndex, 10)].question && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="p-4 bg-primary-light/5 border border-primary-medium/20 text-primary-dark rounded-2xl flex items-start gap-3 text-xs md:text-sm mt-2"
                                                        >
                                                            <AlertCircle size={20} className="text-primary-medium shrink-0 mt-0.5 animate-pulse" />
                                                            <div>
                                                                <p className="font-bold text-gray-900 mb-1">💡 Quick Solution Suggestion:</p>
                                                                <p className="text-gray-600 leading-relaxed">{faqItems[parseInt(selectedFaqIndex, 10)].answer}</p>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Priority Selector */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Priority Level *</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                                    {[
                                                        { id: 'low', label: 'Low', desc: 'Routine inquiry', color: 'border-gray-200 hover:border-gray-300 text-gray-700', active: 'bg-gray-100 border-gray-400 text-gray-900' },
                                                        { id: 'medium', label: 'Medium', desc: 'Standard issue', color: 'border-blue-200 hover:border-blue-300 text-blue-700', active: 'bg-blue-50 border-blue-500 text-blue-800' },
                                                        { id: 'high', label: 'High', desc: 'Work impacted', color: 'border-amber-200 hover:border-amber-300 text-amber-700', active: 'bg-amber-50 border-amber-500 text-amber-800' },
                                                        { id: 'urgent', label: 'Urgent', desc: 'Critical outage', color: 'border-red-200 hover:border-red-300 text-red-700', active: 'bg-red-50 border-red-500 text-red-800' }
                                                    ].map((p) => {
                                                        const isSelected = (formData.priority || 'medium') === p.id;
                                                        return (
                                                            <button
                                                                key={p.id}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, priority: p.id })}
                                                                className={`p-3 rounded-xl border text-left transition-all ${
                                                                    isSelected ? `${p.active} ring-2 ring-offset-1 ring-primary-medium/30 shadow-sm font-bold` : `${p.color} bg-white opacity-80 hover:opacity-100`
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs font-black uppercase tracking-wider">{p.label}</span>
                                                                    {isSelected && <span className="w-2 h-2 rounded-full bg-primary-medium"></span>}
                                                                </div>
                                                                <p className="text-[10px] text-gray-500 mt-1">{p.desc}</p>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Description</label>
                                                <textarea
                                                    rows="6"
                                                    value={formData.message}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, message: e.target.value });
                                                        if (fieldErrors.message) setFieldErrors(prev => ({ ...prev, message: '' }));
                                                    }}
                                                    className={`w-full px-4 py-3 rounded-xl bg-white border ${fieldErrors.message ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'} focus:ring-2 focus:ring-primary-light/20 outline-none transition-all resize-none text-sm`}
                                                    placeholder="Please provide details, error messages, and steps to reproduce the issue..."
                                                ></textarea>
                                                {fieldErrors.message && (
                                                    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                                                        <AlertCircle size={12} /> {fieldErrors.message}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Optional Attachments */}
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                                    Attach Error Screenshot / Logs (Optional)
                                                </label>
                                                <label className="border-2 border-dashed border-gray-200 hover:border-primary-medium rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-primary-light/10">
                                                    <UploadCloud size={24} className="text-primary-medium mb-1.5" />
                                                    <span className="text-xs font-bold text-gray-700">
                                                        {uploadingFiles ? 'Uploading files...' : 'Click or Drag & Drop to attach files'}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400 mt-0.5">
                                                        Images, PDF, Logs, Word, Excel, ZIP (Max 25MB)
                                                    </span>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        disabled={uploadingFiles}
                                                        onChange={handleFileUpload}
                                                        className="hidden"
                                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.log,.zip"
                                                    />
                                                </label>

                                                {attachments.length > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        {attachments.map((att, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                                                                <div className="flex items-center gap-2 truncate">
                                                                    <File size={16} className="text-primary-medium shrink-0" />
                                                                    <span className="font-semibold text-gray-800 truncate">{att.name}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveAttachment(idx)}
                                                                    className="p-1 text-gray-400 hover:text-red-600 rounded-lg"
                                                                >
                                                                    <X size={14} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={status.loading || uploadingFiles}
                                                className="w-full bg-primary-dark text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-dark/20 group disabled:opacity-50"
                                            >
                                                {status.loading ? 'Creating Ticket...' : 'Submit Support Ticket'}
                                                {!status.loading && <Send size={18} className="group-hover:translate-x-1 transition-transform" />}
                                            </button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Support;
