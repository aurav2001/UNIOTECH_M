import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const AdminLogin = ({ onSuccess }) => {
    const { login } = useAdmin();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(password);

        setLoading(false);
        if (result.success) {
            onSuccess?.();
        } else {
            setError(result.error);
            setPassword('');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
        >
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="text-white" size={28} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
                <p className="text-gray-500 text-sm mt-2">Enter password to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-12 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                            placeholder="Enter password"
                            autoFocus
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl"
                    >
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </motion.div>
                )}

                <button
                    type="submit"
                    disabled={loading || !password}
                    className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            <span>Verifying...</span>
                        </>
                    ) : (
                        <span>Access Admin Panel</span>
                    )}
                </button>
            </form>

            <p className="text-center text-gray-400 text-xs mt-6">
                Press <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">ESC</kbd> to close
            </p>
        </motion.div>
    );
};

export default AdminLogin;
