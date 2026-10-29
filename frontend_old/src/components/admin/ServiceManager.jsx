import React, { useState } from 'react';
import { Trash2, Plus, GripVertical, Save, Edit2 } from 'lucide-react';

const availableIcons = [
    'Layers', 'HardDrive', 'Database', 'Lock', 'CloudRain',
    'ArrowLeftRight', 'AtSign', 'UserCog', 'Radio', 'Code',
    'Cpu', 'Globe', 'Shield', 'Smartphone', 'Wifi'
];

const ServiceManager = ({ services, onChange }) => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);

    const handleAdd = () => {
        const newService = {
            title: 'New Service',
            desc: 'Service description goes here.',
            iconName: 'Layers',
            path: '/services/new-service'
        };
        onChange([...services, newService]);
    };

    const handleDelete = (index) => {
        if (!confirm('Delete this service?')) return;
        const newServices = services.filter((_, i) => i !== index);
        onChange(newServices);
        if (editingId === index) {
            setEditingId(null);
            setEditForm(null);
        }
    };

    const startEdit = (index, service) => {
        setEditingId(index);
        setEditForm({ ...service });
    };

    const saveEdit = (index) => {
        const newServices = [...services];
        newServices[index] = editForm;
        onChange(newServices);
        setEditingId(null);
        setEditForm(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm(null);
    };

    // Safe render for when services is undefined or empty
    const serviceList = services || [];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-700">Services List</h4>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-800"
                >
                    <Plus size={16} /> Add Service
                </button>
            </div>

            <div className="grid gap-4">
                {serviceList.map((service, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 transition-shadow hover:shadow-md">
                        {editingId === index ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-dark"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Icon</label>
                                        <select
                                            value={editForm.iconName}
                                            onChange={e => setEditForm({ ...editForm, iconName: e.target.value })}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-dark"
                                        >
                                            {availableIcons.map(icon => (
                                                <option key={icon} value={icon}>{icon}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                                    <textarea
                                        value={editForm.desc}
                                        onChange={e => setEditForm({ ...editForm, desc: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-dark resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Route Path</label>
                                    <input
                                        type="text"
                                        value={editForm.path || ''}
                                        onChange={e => setEditForm({ ...editForm, path: e.target.value })}
                                        placeholder="/services/example"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-dark font-mono text-sm"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={cancelEdit} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button onClick={() => saveEdit(index)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-dark text-white rounded-lg hover:bg-primary-medium">
                                        <Save size={14} /> Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
                                        {/* Icon placeholder or actual icon component could be dynamically loaded here if needed, but text is fine for admin */}
                                        <span className="text-xs font-mono">{service.iconName?.slice(0, 2)}</span>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-gray-800">{service.title}</h5>
                                        <p className="text-sm text-gray-500 line-clamp-1">{service.desc}</p>
                                        {service.path && (
                                            <p className="text-xs text-primary-medium font-mono mt-1">{service.path}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => startEdit(index, service)}
                                        className="p-2 text-gray-400 hover:text-primary-dark hover:bg-gray-50 rounded-lg"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(index)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {serviceList.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                    <p>No services added yet.</p>
                </div>
            )}
        </div>
    );
};

export default ServiceManager;
