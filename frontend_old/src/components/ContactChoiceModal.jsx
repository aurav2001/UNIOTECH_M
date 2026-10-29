import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, X } from 'lucide-react';

const ContactChoiceModal = ({ isOpen, onClose, phoneNumber }) => {
    if (!isOpen) return null;

    const handleCall = () => {
        window.location.href = `tel:${phoneNumber}`;
        onClose();
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/91${phoneNumber}`, '_blank');
        onClose();
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden pointer-events-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Contact Us</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Options */}
                            <div className="p-6 space-y-4">
                                <p className="text-center text-gray-600 mb-4">How would you like to connect with us?</p>

                                <button
                                    onClick={handleCall}
                                    className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 group"
                                >
                                    <div className="w-10 h-10 bg-primary-medium/10 text-primary-medium rounded-full flex items-center justify-center group-hover:bg-primary-medium group-hover:text-white transition-colors">
                                        <Phone size={20} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-bold text-gray-900">Call Us</div>
                                        <div className="text-xs text-gray-500">Direct voice call</div>
                                    </div>
                                </button>

                                <button
                                    onClick={handleWhatsApp}
                                    className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-[#25D366]/5 hover:bg-[#25D366]/10 transition-colors border border-[#25D366]/20 group"
                                >
                                    <div className="w-10 h-10 bg-[#25D366]/10 text-[#25D366] rounded-full flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                                        <MessageCircle size={20} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-bold text-gray-900">WhatsApp</div>
                                        <div className="text-xs text-gray-500">Chat instantly</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ContactChoiceModal;
