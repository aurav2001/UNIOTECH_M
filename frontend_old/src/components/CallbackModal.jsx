import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Clock, User, Send, AlertCircle } from 'lucide-react';
import { validateCallbackForm } from '../utils/validation';

const CallbackModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        time: ''
    });

    const [status, setStatus] = useState({ loading: false, success: false, error: '' });
    const [fieldErrors, setFieldErrors] = useState({});
    const apiUrl = import.meta.env.VITE_API_URL;

    // Prevent background scrolling when. modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setStatus({ loading: false, success: false, error: '' });
            setFieldErrors({});
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validation = validateCallbackForm(formData);
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            return;
        }

        setFieldErrors({});
        setStatus({ loading: true, success: false, error: '' });

        try {
            const res = await fetch(`${apiUrl}/api/callback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus({ loading: false, success: true, error: '' });
                setTimeout(() => {
                    onClose();
                    setFormData({ name: '', phone: '', time: '' });
                }, 1500);
            } else {
                setStatus({ loading: false, success: false, error: 'Failed to request callback. Please try again.' });
            }
        } catch (error) {
            setStatus({ loading: false, success: false, error: 'Network error. Please try again later.' });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 pointer-events-auto"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed z-[70] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="bg-primary-dark p-6 text-white relative">
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer z-10"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-2xl font-bold mb-1">Request a Call</h2>
                            <p className="text-primary-light text-sm">We'll get back to you shortly.</p>
                        </div>

                        {/* Form */}
                        <div className="p-6 md:p-8">
                            {status.success ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Request Sent!</h3>
                                    <p className="text-gray-500 mt-2">We will contact you shortly.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {status.error && (
                                        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                            {status.error}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, name: e.target.value });
                                                    if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
                                                }}
                                                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border ${fieldErrors.name ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'} focus:ring-2 focus:ring-primary-light/20 outline-none transition-all`}
                                                placeholder="Your Name"
                                            />
                                        </div>
                                        {fieldErrors.name && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} /> {fieldErrors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, phone: e.target.value });
                                                    if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                                                }}
                                                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border ${fieldErrors.phone ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'} focus:ring-2 focus:ring-primary-light/20 outline-none transition-all`}
                                                placeholder="+91 9876543210"
                                            />
                                        </div>
                                        {fieldErrors.phone && (
                                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                <AlertCircle size={12} /> {fieldErrors.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Preferred Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <select
                                                value={formData.time}
                                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-medium focus:ring-2 focus:ring-primary-light/20 outline-none transition-all appearance-none"
                                            >
                                                <option value="" disabled selected>Select a time...</option>
                                                <option value="morning">Morning (9AM - 12PM)</option>
                                                <option value="afternoon">Afternoon (12PM - 4PM)</option>
                                                <option value="evening">Evening (4PM - 7PM)</option>
                                                <option value="asap">As soon as possible</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status.loading}
                                        className="w-full bg-primary-dark text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary-dark/20 mt-6 disabled:opacity-70"
                                    >
                                        {status.loading ? 'Sending...' : 'Request Callback'}
                                        {!status.loading && <Send size={18} />}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CallbackModal;
