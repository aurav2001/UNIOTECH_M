import React, { useState } from 'react';
import { Plus, Trash2, Edit2, MessageCircle, Lightbulb, FlaskConical, Rocket, ChevronDown, ChevronUp } from 'lucide-react';

// Available icons for selection
const ICON_OPTIONS = [
    { label: 'Message Circle', value: 'MessageCircle', icon: MessageCircle },
    { label: 'Lightbulb', value: 'Lightbulb', icon: Lightbulb },
    { label: 'Flask', value: 'FlaskConical', icon: FlaskConical },
    { label: 'Rocket', value: 'Rocket', icon: Rocket }
];

const WorkflowManager = ({ data, onChange }) => {
    const safeData = data || { title: '', subtitle: '', description: '', items: [] };
    const [editingItem, setEditingItem] = useState(null);

    const updateField = (field, value) => {
        onChange({ ...safeData, [field]: value });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...(safeData.items || [])];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange({ ...safeData, items: newItems });
    };

    const addItem = () => {
        const newItem = {
            id: (safeData.items?.length || 0) + 1,
            title: 'New Step',
            description: 'Step description goes here.',
            iconName: 'MessageCircle'
        };
        onChange({ ...safeData, items: [...(safeData.items || []), newItem] });
        setEditingItem(safeData.items?.length || 0);
    };

    const removeItem = (index) => {
        if (confirm('Are you sure you want to remove this step?')) {
            const newItems = safeData.items.filter((_, i) => i !== index);
            onChange({ ...safeData, items: newItems });
        }
    };

    return (
        <div className="space-y-8">
            {/* Section Settings */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h4 className="font-bold text-gray-900 border-b pb-2">Section Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Section Title</label>
                        <input
                            type="text"
                            value={safeData.title || ''}
                            onChange={(e) => updateField('title', e.target.value)}
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none"
                            placeholder="e.g. How We Work"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Subtitle</label>
                        <input
                            type="text"
                            value={safeData.subtitle || ''}
                            onChange={(e) => updateField('subtitle', e.target.value)}
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none"
                            placeholder="e.g. Our Process"
                        />
                    </div>
                    <div className="col-span-full">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            value={safeData.description || ''}
                            onChange={(e) => updateField('description', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none resize-none"
                            placeholder="Brief description of the workflow..."
                        />
                    </div>
                </div>
            </div>

            {/* Workflow Steps */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900">Workflow Steps</h4>
                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 text-sm font-bold text-primary-dark hover:text-gray-700"
                    >
                        <Plus size={18} />
                        Add Step
                    </button>
                </div>

                <div className="space-y-4">
                    {safeData.items?.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white border boundary-gray-200 rounded-xl overflow-hidden transition-all hover:shadow-md"
                        >
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer bg-gray-50"
                                onClick={() => setEditingItem(editingItem === index ? null : index)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-500">
                                        {index + 1}
                                    </div>
                                    <span className="font-bold text-gray-900">{item.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeItem(index);
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    {editingItem === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>

                            {editingItem === index && (
                                <div className="p-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-full">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Step Title</label>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) => updateItem(index, 'title', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-full">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                        <textarea
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none resize-none"
                                        />
                                    </div>
                                    <div className="col-span-full">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Icon</label>
                                        <div className="flex gap-2">
                                            {ICON_OPTIONS.map((option) => {
                                                const Icon = option.icon;
                                                return (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => updateItem(index, 'iconName', option.value)}
                                                        className={`p-3 rounded-xl border ${item.iconName === option.value
                                                            ? 'bg-gray-900 text-white border-gray-900'
                                                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                                            }`}
                                                        title={option.label}
                                                    >
                                                        <Icon size={20} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkflowManager;
