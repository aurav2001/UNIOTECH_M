import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

const PricingManager = ({ data, onChange }) => {
    // Ensure data exists
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

    const updateFeature = (planIndex, featureIndex, value) => {
        const newItems = [...(safeData.items || [])];
        const newFeatures = [...(newItems[planIndex].features || [])];
        newFeatures[featureIndex] = value;
        newItems[planIndex].features = newFeatures;
        onChange({ ...safeData, items: newItems });
    };

    const addFeature = (planIndex) => {
        const newItems = [...(safeData.items || [])];
        const newFeatures = [...(newItems[planIndex].features || []), ""];
        newItems[planIndex].features = newFeatures;
        onChange({ ...safeData, items: newItems });
    };

    const removeFeature = (planIndex, featureIndex) => {
        const newItems = [...(safeData.items || [])];
        newItems[planIndex].features = newItems[planIndex].features.filter((_, i) => i !== featureIndex);
        onChange({ ...safeData, items: newItems });
    };

    const addItem = () => {
        const newItem = {
            id: Date.now(),
            name: 'New Plan',
            priceMonthly: '0',
            features: ['Feature 1'],
            popular: false
        };
        onChange({ ...safeData, items: [...(safeData.items || []), newItem] });
        setEditingItem(safeData.items ? safeData.items.length : 0);
    };

    const deleteItem = (index) => {
        if (!confirm('Delete this plan?')) return;
        const newItems = safeData.items.filter((_, i) => i !== index);
        onChange({ ...safeData, items: newItems });
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pricing Section Details</h3>
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
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Subtitle</label>
                        <textarea
                            value={safeData.subtitle || ''}
                            onChange={(e) => updateField('subtitle', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Plans List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Pricing Plans</h3>
                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors text-sm font-bold"
                    >
                        <Plus size={16} />
                        Add Plan
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
                                    <span className="font-bold text-gray-900">{item.name || 'Untitled Plan'}</span>
                                    {item.popular && (
                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Popular</span>
                                    )}
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
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Plan Name</label>
                                            <input
                                                type="text"
                                                value={item.name || ''}
                                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Monthly Price</label>
                                            <input
                                                type="text"
                                                value={item.priceMonthly || ''}
                                                onChange={(e) => updateItem(index, 'priceMonthly', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Tagline</label>
                                        <input
                                            type="text"
                                            value={item.tagline || ''}
                                            onChange={(e) => updateItem(index, 'tagline', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Button Text</label>
                                        <input
                                            type="text"
                                            value={item.buttonText || ''}
                                            onChange={(e) => updateItem(index, 'buttonText', e.target.value)}
                                            placeholder="Get Started"
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">Features</label>
                                        <div className="space-y-2">
                                            {item.features && item.features.map((feature, fIndex) => (
                                                <div key={fIndex} className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={feature}
                                                        onChange={(e) => updateFeature(index, fIndex, e.target.value)}
                                                        className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                                                    />
                                                    <button
                                                        onClick={() => removeFeature(index, fIndex)}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addFeature(index)}
                                                className="text-xs font-bold text-primary-dark hover:text-primary-medium flex items-center gap-1 mt-2"
                                            >
                                                <Plus size={12} /> Add Feature
                                            </button>
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer mt-4">
                                        <input
                                            type="checkbox"
                                            checked={item.popular}
                                            onChange={(e) => updateItem(index, 'popular', e.target.checked)}
                                            className="w-4 h-4 rounded accent-primary-dark"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Mark as Most Popular</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PricingManager;
