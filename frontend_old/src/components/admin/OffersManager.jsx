import React, { useState } from 'react';
import { Plus, Trash2, Tag, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const OffersManager = ({ data, onChange }) => {
    const safeData = data || { title: '', subtitle: '', items: [] };
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
            id: Date.now(),
            title: 'New Offer',
            description: 'Offer details here',
            code: 'CODE123',
            discount: '10%'
        };
        onChange({ ...safeData, items: [...(safeData.items || []), newItem] });
        setEditingItem(safeData.items ? safeData.items.length : 0);
    };

    const deleteItem = (index) => {
        if (!confirm('Delete this offer?')) return;
        const newItems = safeData.items.filter((_, i) => i !== index);
        onChange({ ...safeData, items: newItems });
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Offers Section Details</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Section Title</label>
                        <input
                            type="text"
                            value={safeData.title || ''}
                            onChange={(e) => updateField('title', e.target.value)}
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Offers List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Active Offers</h3>
                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors text-sm font-bold"
                    >
                        <Plus size={16} />
                        Add Offer
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {safeData.items && safeData.items.map((item, index) => (
                        <div key={index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div
                                className="p-4 flex items-center justify-between bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => setEditingItem(editingItem === index ? null : index)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <Tag size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{item.title}</h4>
                                        <div className="text-xs font-bold text-primary-dark bg-primary-light/10 px-2 py-0.5 rounded-full w-fit mt-1">
                                            {item.code}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteItem(index); }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    {editingItem === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                            </div>

                            {editingItem === index && (
                                <div className="p-6 border-t border-gray-100 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Offer Title</label>
                                            <input
                                                type="text"
                                                value={item.title || ''}
                                                onChange={(e) => updateItem(index, 'title', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Discount Text</label>
                                            <input
                                                type="text"
                                                value={item.discount || ''}
                                                onChange={(e) => updateItem(index, 'discount', e.target.value)}
                                                placeholder="e.g. 20% OFF"
                                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                                        <textarea
                                            value={item.description || ''}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Coupon Code</label>
                                            <div className="relative">
                                                <Tag size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={item.code || ''}
                                                    onChange={(e) => updateItem(index, 'code', e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-mono uppercase"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Valid Until</label>
                                            <div className="relative">
                                                <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={item.expiry || ''}
                                                    onChange={(e) => updateItem(index, 'expiry', e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                                                />
                                            </div>
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

export default OffersManager;
