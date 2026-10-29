import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { validateEnquiryForm } from '../utils/validation';

const EnquiryModal = ({ isOpen, onClose, source }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('idle'); // idle, success, error
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            // Reset form after transition time
            const timer = setTimeout(() => {
                setFormData({ name: '', email: '', phone: '', message: '' });
                setErrors({});
                setSubmitStatus('idle');
                setErrorMessage('');
            }, 300);
            return () => clearTimeout(timer);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validation = validateEnquiryForm(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const response = await fetch(`${API_URL}/api/enquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    source: source || 'General Enquiry'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit enquiry');
            }

            setSubmitStatus('success');
            // Auto close after success? Maybe wait for user to close.
        } catch (error) {
            setSubmitStatus('error');
            setErrorMessage(error.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Get in Touch</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Enquiring about: <span className="font-semibold text-primary-medium">{source}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 overflow-y-auto">
                                {submitStatus === 'success' ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle size={32} />
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">Enquiry Sent!</h4>
                                        <p className="text-gray-600 mb-6">
                                            Thank you for your interest. Our team will review your enquiry regarding <strong>{source}</strong> and get back to you shortly.
                                        </p>
                                        <button
                                            onClick={onClose}
                                            className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                                        >
                                            Close
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {submitStatus === 'error' && (
                                            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-start gap-3 text-sm">
                                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                                <p>{errorMessage}</p>
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-light/50 outline-none transition-all ${errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'}`}
                                                placeholder="Enter your full name"
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-light/50 outline-none transition-all ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'}`}
                                                    placeholder="Enter your email address"
                                                />
                                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                            </div>

                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-light/50 outline-none transition-all ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'}`}
                                                    placeholder="Enter your phone number"
                                                />
                                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700">
                                                {source === 'Quick Message' ? 'Short Message' : 'Message'}
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={source === 'Quick Message' ? "2" : "4"}
                                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary-light/50 outline-none transition-all resize-none ${errors.message ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-primary-medium'}`}
                                                placeholder={source === 'Quick Message' ? "Enter your short message here..." : "Tell us about your requirements..."}
                                            ></textarea>
                                            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-3 bg-primary-dark hover:bg-primary-medium text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    'Submit Enquiry'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EnquiryModal;
