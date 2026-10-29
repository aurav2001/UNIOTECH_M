import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Trash2, MapPin, Clock, Users, Save, X, Loader2, RefreshCw } from 'lucide-react';

// import { useAdmin } from '../../context/AdminContext';
import { apiRequest } from '../../utils/api';

const CareersManager = () => {
    const [openings, setOpenings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: 'Remote',
        type: 'Full-time',
        vacancies: 1
    });

    const apiUrl = import.meta.env.VITE_API_URL;

    // Fetch openings
    const fetchOpenings = async () => {
        setLoading(true);
        try {
            const res = await apiRequest('/api/careers/openings');
            const data = await res.json();
            if (data.success) {
                setOpenings(data.data || []);
            }
        } catch (error) {
            // Handle silently
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOpenings();
    }, []);

    // Add new opening
    const handleAddOpening = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await apiRequest('/api/careers/openings', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setOpenings([...openings, data.data]);
                setFormData({ title: '', department: '', location: 'Remote', type: 'Full-time', vacancies: 1 });
                setShowForm(false);
            }
        } catch (error) {
            // Handle error
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this job opening?')) return;

        try {
            const res = await apiRequest(`/api/careers/openings/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setOpenings(openings.filter(o => o.id !== id));
            }
        } catch (error) {
            // Handle error
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Briefcase className="text-primary-medium" size={24} />
                        Job Openings
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Manage job positions displayed on the website</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchOpenings}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-primary-medium transition-colors"
                    >
                        <Plus size={18} />
                        Add Opening
                    </button>
                </div>
            </div>

            {/* Add Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Add Job Opening</h3>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddOpening} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-medium"
                                        placeholder="e.g. Frontend Developer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-medium"
                                        placeholder="e.g. Engineering"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-medium"
                                            placeholder="e.g. Remote"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-medium"
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Vacancies</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.vacancies}
                                        onChange={(e) => setFormData({ ...formData, vacancies: parseInt(e.target.value) || 1 })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-medium"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving || !formData.title}
                                    className="w-full flex items-center justify-center gap-2 bg-primary-dark text-white py-3 rounded-lg hover:bg-primary-medium transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <><Loader2 size={18} className="animate-spin" /> Saving...</>
                                    ) : (
                                        <><Save size={18} /> Add Job Opening</>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Openings List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-primary-medium" />
                </div>
            ) : openings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Briefcase size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No job openings yet</p>
                    <p className="text-sm">Click "Add Opening" to post a new position</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {openings.map((opening) => (
                        <motion.div
                            key={opening.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-light transition-colors"
                        >
                            <div>
                                <h4 className="font-bold text-gray-900">{opening.title}</h4>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                                    {opening.department && (
                                        <span className="flex items-center gap-1">
                                            <Briefcase size={14} />
                                            {opening.department}
                                        </span>
                                    )}
                                    {opening.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} />
                                            {opening.location}
                                        </span>
                                    )}
                                    {opening.type && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {opening.type}
                                        </span>
                                    )}
                                    {opening.vacancies && (
                                        <span className="flex items-center gap-1 text-green-600 font-medium">
                                            <Users size={14} />
                                            {opening.vacancies} {opening.vacancies === 1 ? 'vacancy' : 'vacancies'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(opening.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CareersManager;
