import React, { useState } from 'react';
import { Trash2, Plus, Save, Edit2, X } from 'lucide-react';

const availableIcons = [
    'Layers', 'HardDrive', 'Database', 'Lock', 'CloudRain',
    'ArrowLeftRight', 'AtSign', 'UserCog', 'Radio', 'Code',
    'Cpu', 'Globe', 'Shield', 'Smartphone', 'Wifi',
    'Rocket', 'Users', 'CheckCircle', 'Award'
];

/**
 * Generic List Manager Component
 * @param {Array} items - The array of objects to manage
 * @param {Function} onChange - Callback when items change (returns new array)
 * @param {Object} schema - Definition of fields: { key: { label, type: 'text'|'textarea'|'icon' } }
 * @param {String} title - Section title
 */
const ListManager = ({ items = [], onChange, schema, title }) => {
    const [editingIndex, setEditingIndex] = useState(null);
    const [editForm, setEditForm] = useState(null);

    // Initialize formatting based on schema for a new item
    const getEmptyItem = () => {
        const item = {};
        Object.keys(schema).forEach(key => item[key] = '');
        // default icon if present
        if (schema.icon || schema.iconName) item.icon = 'Layers'; // default
        return item;
    };

    const handleAdd = () => {
        setEditForm(getEmptyItem());
        setEditingIndex('new');
    };

    const handleDelete = (index) => {
        if (!window.confirm('Delete this item?')) return;
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    };

    const startEdit = (index, item) => {
        setEditingIndex(index);
        setEditForm({ ...item });
    };

    const saveEdit = () => {
        const newItems = [...items];
        if (editingIndex === 'new') {
            newItems.push(editForm);
        } else {
            newItems[editingIndex] = editForm;
        }
        onChange(newItems);
        cancelEdit();
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditForm(null);
    };

    const updateForm = (key, value) => {
        setEditForm(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-gray-800">{title}</h4>
                <button
                    onClick={handleAdd}
                    disabled={editingIndex !== null}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={16} /> Add Item
                </button>
            </div>

            {/* Edit Form (Overlay or Inline) - Using inline for simplicity at top if 'new', else replace item */}
            {editingIndex === 'new' && (
                <div className="bg-gray-50 p-4 rounded-xl border border-primary-medium/20 mb-4 animate-in fade-in slide-in-from-top-2">
                    <h5 className="font-bold text-sm text-primary-dark mb-4">New Item</h5>
                    <div className="grid gap-4 md:grid-cols-2">
                        {Object.entries(schema).map(([key, config]) => (
                            <div key={key} className={config.type === 'textarea' ? 'col-span-full' : ''}>
                                <label className="block text-xs font-bold text-gray-500 mb-1 capitalize">{config.label}</label>
                                {config.type === 'textarea' ? (
                                    <textarea
                                        value={editForm[key]}
                                        onChange={e => updateForm(key, e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-dark h-20 resize-none"
                                    />
                                ) : config.type === 'icon' ? (
                                    <select
                                        value={editForm[key]}
                                        onChange={e => updateForm(key, e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-dark"
                                    >
                                        {availableIcons.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={editForm[key]}
                                        onChange={e => updateForm(key, e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-dark"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={cancelEdit} className="px-4 py-2 text-sm text-gray-500 hover:bg-white rounded-lg">Cancel</button>
                        <button onClick={saveEdit} className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-dark text-white rounded-lg hover:bg-primary-medium">
                            <Save size={16} /> Save Item
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {items.length === 0 && editingIndex !== 'new' && (
                    <div className="text-center py-8 text-gray-400 text-sm italic">No items yet. Add one to get started.</div>
                )}

                {items.map((item, index) => (
                    <div key={index} className="group flex items-start justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all bg-white">
                        {editingIndex === index ? (
                            <div className="w-full space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {Object.entries(schema).map(([key, config]) => (
                                        <div key={key} className={config.type === 'textarea' ? 'col-span-full' : ''}>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 capitalize">{config.label}</label>
                                            {config.type === 'textarea' ? (
                                                <textarea
                                                    value={editForm[key]}
                                                    onChange={e => updateForm(key, e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-dark h-20 resize-none"
                                                />
                                            ) : config.type === 'icon' ? (
                                                <select
                                                    value={editForm[key]}
                                                    onChange={e => updateForm(key, e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-dark"
                                                >
                                                    {availableIcons.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={editForm[key]}
                                                    onChange={e => updateForm(key, e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-primary-dark"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button onClick={cancelEdit} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                                    <button onClick={saveEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-dark text-white rounded-lg hover:bg-primary-medium">
                                        <Save size={14} /> Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    {/* Try to find a 'title' or 'label' key to show as main text */}
                                    <h5 className="font-bold text-gray-800 text-sm">
                                        {item.title || item.label || item.year || `Item ${index + 1}`}
                                    </h5>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                        {item.desc || item.text || item.description || ''}
                                    </p>
                                    {/* Show badges for short fields */}
                                    <div className="flex gap-2 mt-2">
                                        {item.year && <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">{item.year}</span>}
                                        {item.value && <span className="text-[10px] bg-primary-light/10 px-2 py-0.5 rounded text-primary-dark font-medium">{item.value}</span>}
                                        {item.icon && <span className="text-[10px] border border-gray-200 px-2 py-0.5 rounded text-gray-400 font-mono">{item.icon}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit(index, item)} className="p-2 text-gray-400 hover:text-primary-medium hover:bg-gray-50 rounded-lg transition-colors">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(index)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ListManager;
