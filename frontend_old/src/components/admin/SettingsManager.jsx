import React, { useState } from 'react';
import { Settings, Loader2 } from 'lucide-react';
import { apiRequest } from '../../utils/api';

const SettingsManager = () => {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleInit = async () => {
        if (!confirm('This will restore all default content to the database. Existing data for missing sections will be created. Continue?')) return;
        setLoading(true);
        try {
            const res = await apiRequest('/api/content/init', {
                method: 'POST'
            });
            if (res.ok) {
                setMsg('Content restored successfully! Reloading...');
                // Wait a moment for DB to settle then refresh local state
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                setMsg('Failed to initialize content.');
            }
        } catch (error) {
            setMsg('Error connecting to server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h3 className="text-xl font-bold mb-6">Settings</h3>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 max-w-xl">
                <h4 className="font-bold text-gray-800 mb-2">Content Initialization</h4>
                <p className="text-gray-500 text-sm mb-6">
                    If your website content is missing or empty, use this to populate default values (Hero, Services list, etc.).
                    Your existing pages will not be deleted.
                </p>

                <button
                    onClick={handleInit}
                    disabled={loading}
                    className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Settings size={18} />}
                    <span>Initialize Default Content</span>
                </button>

                {msg && <p className="mt-4 text-sm font-medium text-gray-800">{msg}</p>}
            </div>
        </div>
    );
};

export default SettingsManager;
