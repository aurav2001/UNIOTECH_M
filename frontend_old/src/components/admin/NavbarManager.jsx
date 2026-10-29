import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit2, X, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
// import { useAdmin } from '../../context/AdminContext';
import { apiRequest } from '../../utils/api';

const availableIcons = [
    'Monitor', 'Server', 'Shield', 'Database', 'Cloud', 'Mail', 'Users',
    'FileText', 'Wifi', 'Briefcase', 'TrendingUp', 'Lightbulb', 'ClipboardCheck',
    'HardDrive', 'Cpu', 'Globe', 'Lock', 'Radio', 'Code', 'Smartphone'
];

const defaultNavbar = {
    categories: [
        {
            id: 'hardware',
            name: 'Hardware',
            items: [
                { name: "Hardware Supply", desc: "Lenovo, Dell, HP, IBM, QNAP", icon: "Server", path: "/services/hardware-supply" },
                { name: "Server Support", desc: "Physical Server, Nutanix, Hypervisor", icon: "Database", path: "" },
                { name: "Networking", desc: "Active/Passive, CCTV, Biometric", icon: "Wifi", path: "" },
                { name: "AMC Support", desc: "Firewall, Server, Desktop Support", icon: "FileText", path: "" }
            ]
        },
        {
            id: 'software',
            name: 'Software',
            items: [
                { name: "Software Solutions", desc: "Adobe, MongoDB, Office 365", icon: "Monitor", path: "" },
                { name: "Cybersecurity", desc: "Sophos, Fortinet, SSL, Firewall", icon: "Shield", path: "" },
                { name: "Cloud & Backup", desc: "Azure, AWS, Acronis, Veeam", icon: "Cloud", path: "" },
                { name: "Migration & Email", desc: "Server/Email Migration, O365", icon: "Mail", path: "" },
                { name: "Managed Services", desc: "Virtual IT Manager", icon: "Users", path: "" }
            ]
        },
        {
            id: 'consulting',
            name: 'Consulting',
            items: [
                { name: "IT Strategy", desc: "Roadmap Building & Planning", icon: "Briefcase", path: "" },
                { name: "Digital Transformation", desc: "Modernize Workflows & Tools", icon: "TrendingUp", path: "" },
                { name: "Tech Consultancy", desc: "Expert Advisory & Guidance", icon: "Lightbulb", path: "" },
                { name: "Security Audits", desc: "Risk Assessment & Compliance", icon: "ClipboardCheck", path: "" }
            ]
        }
    ]
};

const NavbarManager = () => {
    const [navData, setNavData] = useState(defaultNavbar);
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [expandedCategory, setExpandedCategory] = useState('hardware');
    const [editingItem, setEditingItem] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        fetchNavbar();
    }, []);

    const fetchNavbar = async () => {
        try {
            const res = await apiRequest('/api/content/navbar');
            const data = await res.json();
            if (data.data && data.data.categories) {
                setNavData(data.data);
            }
        } catch (error) {
            // Handle error silently
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await apiRequest('/api/content/navbar', {
                method: 'PUT',
                body: JSON.stringify({ data: navData })
            });

            const data = await res.json(); // Consuming body if needed, but res.ok check is clearer below

            if (!res.ok) throw new Error('Failed to save');
            setNotification({ type: 'success', message: 'Navigation saved successfully!' });
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to save navigation.' });
        } finally {
            setIsSaving(false);
        }
    };

    const updateCategoryName = (categoryId, newName) => {
        setNavData(prev => ({
            ...prev,
            categories: prev.categories.map(cat =>
                cat.id === categoryId ? { ...cat, name: newName } : cat
            )
        }));
    };

    const startEdit = (categoryId, itemIndex, item) => {
        setEditingItem({ categoryId, itemIndex });
        setEditForm({ ...item });
    };

    const saveEdit = () => {
        const { categoryId, itemIndex } = editingItem;
        setNavData(prev => ({
            ...prev,
            categories: prev.categories.map(cat =>
                cat.id === categoryId
                    ? { ...cat, items: cat.items.map((item, idx) => idx === itemIndex ? editForm : item) }
                    : cat
            )
        }));
        setEditingItem(null);
        setEditForm({});
    };

    const cancelEdit = () => {
        setEditingItem(null);
        setEditForm({});
    };

    const addItem = (categoryId) => {
        const newItem = { name: "New Item", desc: "Description", icon: "Monitor", path: "" };
        setNavData(prev => ({
            ...prev,
            categories: prev.categories.map(cat =>
                cat.id === categoryId
                    ? { ...cat, items: [...cat.items, newItem] }
                    : cat
            )
        }));
    };

    const deleteItem = (categoryId, itemIndex) => {
        if (!window.confirm('Delete this menu item?')) return;
        setNavData(prev => ({
            ...prev,
            categories: prev.categories.map(cat =>
                cat.id === categoryId
                    ? { ...cat, items: cat.items.filter((_, idx) => idx !== itemIndex) }
                    : cat
            )
        }));
    };

    const moveItem = (categoryId, itemIndex, direction) => {
        setNavData(prev => ({
            ...prev,
            categories: prev.categories.map(cat => {
                if (cat.id !== categoryId) return cat;
                const newItems = [...cat.items];
                const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
                if (targetIndex < 0 || targetIndex >= newItems.length) return cat;
                [newItems[itemIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[itemIndex]];
                return { ...cat, items: newItems };
            })
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Navigation Manager</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage menu categories and their items</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 transition-all"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`p-4 rounded-xl text-sm font-medium ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {notification.message}
                </div>
            )}

            {/* Categories */}
            <div className="space-y-4">
                {navData.categories.map((category) => (
                    <div key={category.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        {/* Category Header */}
                        <div
                            className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                        >
                            <div className="flex items-center gap-3">
                                <GripVertical size={16} className="text-gray-400" />
                                <input
                                    type="text"
                                    value={category.name}
                                    onChange={(e) => updateCategoryName(category.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-gray-900 outline-none px-1"
                                />
                                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                                    {category.items.length} items
                                </span>
                            </div>
                            {expandedCategory === category.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>

                        {/* Category Items */}
                        {expandedCategory === category.id && (
                            <div className="p-4 space-y-3">
                                {category.items.map((item, idx) => (
                                    <div key={idx} className="group flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all bg-white">
                                        {editingItem?.categoryId === category.id && editingItem?.itemIndex === idx ? (
                                            /* Edit Mode */
                                            <div className="flex-1 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Name</label>
                                                        <input
                                                            type="text"
                                                            value={editForm.name}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 outline-none text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1">Icon</label>
                                                        <select
                                                            value={editForm.icon}
                                                            onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 outline-none text-sm"
                                                        >
                                                            {availableIcons.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.desc}
                                                        onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 outline-none text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1">Route Path</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.path}
                                                        onChange={(e) => setEditForm({ ...editForm, path: e.target.value })}
                                                        placeholder="/services/example"
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-gray-900 outline-none text-sm font-mono"
                                                    />
                                                </div>
                                                <div className="flex justify-end gap-2 pt-2">
                                                    <button onClick={cancelEdit} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                                                    <button onClick={saveEdit} className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800">Save</button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* View Mode */
                                            <>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => moveItem(category.id, idx, 'up')} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                                                        <ChevronUp size={14} />
                                                    </button>
                                                    <button onClick={() => moveItem(category.id, idx, 'down')} disabled={idx === category.items.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                                                        <ChevronDown size={14} />
                                                    </button>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-mono">{item.icon}</span>
                                                        <span className="font-semibold text-gray-800 text-sm">{item.name}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                                    <p className="text-xs text-primary-medium font-mono mt-1">{item.path || '(no route)'}</p>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEdit(category.id, idx, item)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => deleteItem(category.id, idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {/* Add Item Button */}
                                <button
                                    onClick={() => addItem(category.id)}
                                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                >
                                    <Plus size={16} /> Add Menu Item
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Missing import for Loader2 - adding inline
const Loader2 = ({ size, className }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default NavbarManager;
