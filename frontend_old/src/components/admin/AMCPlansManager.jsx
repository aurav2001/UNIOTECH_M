import React, { useState } from 'react';
import { Plus, Trash2, X, ChevronDown, ChevronUp, Home, Building2 } from 'lucide-react';

// ─── Plan Card Editor (Declared outside parent component to prevent losing input focus) ───
const PlanCardEditor = ({ 
    plan, 
    index, 
    planType, 
    icon, 
    editingPlan, 
    setEditingPlan, 
    updatePlanItem, 
    deletePlan, 
    updatePlanFeature, 
    addPlanFeature, 
    removePlanFeature 
}) => {
    const key = `${planType}-${index}`;
    const isOpen = editingPlan === key;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div
                className="p-4 flex items-center justify-between bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setEditingPlan(isOpen ? null : key)}
            >
                <div className="flex items-center gap-3">
                    <div className="text-gray-400">{icon}</div>
                    <span className="font-bold text-gray-900">{plan.name || 'Untitled Plan'}</span>
                    <span className="text-sm text-gray-500">₹{plan.price}{plan.period}</span>
                    {plan.popular && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Popular</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); deletePlan(planType, index); }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                        <Trash2 size={16} />
                    </button>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>

            {isOpen && (
                <div className="p-6 border-t border-gray-100 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Plan Name</label>
                            <input
                                type="text"
                                value={plan.name || ''}
                                onChange={(e) => updatePlanItem(planType, index, 'name', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:border-gray-900 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Price</label>
                            <input
                                type="text"
                                value={plan.price || ''}
                                onChange={(e) => updatePlanItem(planType, index, 'price', e.target.value)}
                                placeholder="e.g. 2,999 or Custom"
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:border-gray-900 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Tagline</label>
                            <input
                                type="text"
                                value={plan.tagline || ''}
                                onChange={(e) => updatePlanItem(planType, index, 'tagline', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:border-gray-900 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Period</label>
                            <input
                                type="text"
                                value={plan.period || ''}
                                onChange={(e) => updatePlanItem(planType, index, 'period', e.target.value)}
                                placeholder="/year or /month"
                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:border-gray-900 outline-none"
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Features</label>
                        <div className="space-y-2">
                            {plan.features && plan.features.map((feature, fIndex) => (
                                <div key={fIndex} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => updatePlanFeature(planType, index, fIndex, e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:border-gray-900 outline-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePlanFeature(planType, index, fIndex)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addPlanFeature(planType, index)}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
                            >
                                <Plus size={12} /> Add Feature
                            </button>
                        </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer mt-4">
                        <input
                            type="checkbox"
                            checked={plan.popular || false}
                            onChange={(e) => updatePlanItem(planType, index, 'popular', e.target.checked)}
                            className="w-4 h-4 rounded accent-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Mark as Most Popular</span>
                    </label>
                </div>
            )}
        </div>
    );
};

const AMCPlansManager = ({ data, onChange }) => {
    const safeData = data || {
        heroTitle: '', heroSubtitle: '', detailsTitle: '', detailsContent: '',
        detailsFeatures: [], homePlans: [], corporatePlans: [], faq: []
    };
    const [editingPlan, setEditingPlan] = useState(null);
    const [editingFaq, setEditingFaq] = useState(null);
    const [activeTab, setActiveTab] = useState('general');

    const updateField = (field, value) => {
        onChange({ ...safeData, [field]: value });
    };

    // ─── Plan CRUD ──────────────────────────────────────────
    const updatePlanItem = (planType, index, field, value) => {
        const plans = [...(safeData[planType] || [])];
        plans[index] = { ...plans[index], [field]: value };
        onChange({ ...safeData, [planType]: plans });
    };

    const addPlan = (planType) => {
        const newPlan = {
            name: 'New Plan',
            tagline: '',
            price: '0',
            period: '/year',
            popular: false,
            features: ['Feature 1']
        };
        const plans = [...(safeData[planType] || []), newPlan];
        onChange({ ...safeData, [planType]: plans });
    };

    const deletePlan = (planType, index) => {
        if (!confirm('Delete this plan?')) return;
        const plans = safeData[planType].filter((_, i) => i !== index);
        onChange({ ...safeData, [planType]: plans });
    };

    // ─── Plan Feature CRUD ──────────────────────────────────
    const updatePlanFeature = (planType, planIndex, featureIndex, value) => {
        const plans = [...(safeData[planType] || [])];
        const features = [...(plans[planIndex].features || [])];
        features[featureIndex] = value;
        plans[planIndex] = { ...plans[planIndex], features };
        onChange({ ...safeData, [planType]: plans });
    };

    const addPlanFeature = (planType, planIndex) => {
        const plans = [...(safeData[planType] || [])];
        const features = [...(plans[planIndex].features || []), ''];
        plans[planIndex] = { ...plans[planIndex], features };
        onChange({ ...safeData, [planType]: plans });
    };

    const removePlanFeature = (planType, planIndex, featureIndex) => {
        const plans = [...(safeData[planType] || [])];
        plans[planIndex].features = plans[planIndex].features.filter((_, i) => i !== featureIndex);
        onChange({ ...safeData, [planType]: plans });
    };

    // ─── Details Features CRUD ──────────────────────────────
    const updateDetailsFeature = (index, value) => {
        const features = [...(safeData.detailsFeatures || [])];
        features[index] = value;
        onChange({ ...safeData, detailsFeatures: features });
    };

    const addDetailsFeature = () => {
        const features = [...(safeData.detailsFeatures || []), ''];
        onChange({ ...safeData, detailsFeatures: features });
    };

    const removeDetailsFeature = (index) => {
        const features = safeData.detailsFeatures.filter((_, i) => i !== index);
        onChange({ ...safeData, detailsFeatures: features });
    };

    // ─── FAQ CRUD ───────────────────────────────────────────
    const updateFaq = (index, field, value) => {
        const faq = [...(safeData.faq || [])];
        faq[index] = { ...faq[index], [field]: value };
        onChange({ ...safeData, faq });
    };

    const addFaq = () => {
        const faq = [...(safeData.faq || []), { question: '', answer: '' }];
        onChange({ ...safeData, faq });
        setEditingFaq(faq.length - 1);
    };

    const deleteFaq = (index) => {
        if (!confirm('Delete this FAQ?')) return;
        const faq = safeData.faq.filter((_, i) => i !== index);
        onChange({ ...safeData, faq });
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                {[
                    { id: 'general', label: 'General' },
                    { id: 'homePlans', label: 'Home Plans' },
                    { id: 'corporatePlans', label: 'Corporate Plans' },
                    { id: 'faq', label: 'FAQ' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            activeTab === tab.id
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══ GENERAL TAB ═══ */}
            {activeTab === 'general' && (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Hero Section</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Hero Title</label>
                                <input
                                    type="text"
                                    value={safeData.heroTitle || ''}
                                    onChange={(e) => updateField('heroTitle', e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Hero Subtitle</label>
                                <textarea
                                    value={safeData.heroSubtitle || ''}
                                    onChange={(e) => updateField('heroSubtitle', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">AMC Details Section</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Details Title</label>
                                <input
                                    type="text"
                                    value={safeData.detailsTitle || ''}
                                    onChange={(e) => updateField('detailsTitle', e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Details Content</label>
                                <textarea
                                    value={safeData.detailsContent || ''}
                                    onChange={(e) => updateField('detailsContent', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Details Features</label>
                                <div className="space-y-2">
                                    {(safeData.detailsFeatures || []).map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => updateDetailsFeature(idx, e.target.value)}
                                                className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:border-gray-900 outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeDetailsFeature(idx)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addDetailsFeature}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
                                    >
                                        <Plus size={12} /> Add Feature
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ HOME PLANS TAB ═══ */}
            {activeTab === 'homePlans' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Home size={20} /> Home Plans
                        </h3>
                        <button
                            type="button"
                            onClick={() => addPlan('homePlans')}
                            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors text-sm font-bold"
                        >
                            <Plus size={16} /> Add Plan
                        </button>
                    </div>
                    <div className="space-y-4">
                        {(safeData.homePlans || []).map((plan, idx) => (
                            <PlanCardEditor
                                key={idx}
                                plan={plan}
                                index={idx}
                                planType="homePlans"
                                icon={<Home size={16} />}
                                editingPlan={editingPlan}
                                setEditingPlan={setEditingPlan}
                                updatePlanItem={updatePlanItem}
                                deletePlan={deletePlan}
                                updatePlanFeature={updatePlanFeature}
                                addPlanFeature={addPlanFeature}
                                removePlanFeature={removePlanFeature}
                            />
                        ))}
                        {(!safeData.homePlans || safeData.homePlans.length === 0) && (
                            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                No home plans yet. Click "Add Plan" to create one.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ CORPORATE PLANS TAB ═══ */}
            {activeTab === 'corporatePlans' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Building2 size={20} /> Corporate Plans
                        </h3>
                        <button
                            type="button"
                            onClick={() => addPlan('corporatePlans')}
                            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors text-sm font-bold"
                        >
                            <Plus size={16} /> Add Plan
                        </button>
                    </div>
                    <div className="space-y-4">
                        {(safeData.corporatePlans || []).map((plan, idx) => (
                            <PlanCardEditor
                                key={idx}
                                plan={plan}
                                index={idx}
                                planType="corporatePlans"
                                icon={<Building2 size={16} />}
                                editingPlan={editingPlan}
                                setEditingPlan={setEditingPlan}
                                updatePlanItem={updatePlanItem}
                                deletePlan={deletePlan}
                                updatePlanFeature={updatePlanFeature}
                                addPlanFeature={addPlanFeature}
                                removePlanFeature={removePlanFeature}
                            />
                        ))}
                        {(!safeData.corporatePlans || safeData.corporatePlans.length === 0) && (
                            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                No corporate plans yet. Click "Add Plan" to create one.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ FAQ TAB ═══ */}
            {activeTab === 'faq' && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">FAQ Items</h3>
                        <button
                            type="button"
                            onClick={addFaq}
                            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors text-sm font-bold"
                        >
                            <Plus size={16} /> Add FAQ
                        </button>
                    </div>
                    <div className="space-y-4">
                        {(safeData.faq || []).map((faq, idx) => (
                            <div key={idx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div
                                    className="p-4 flex items-center justify-between bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                    onClick={() => setEditingFaq(editingFaq === idx ? null : idx)}
                                >
                                    <span className="font-bold text-gray-900 text-sm truncate pr-4">
                                        {faq.question || 'Untitled Question'}
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); deleteFaq(idx); }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        {editingFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>
                                {editingFaq === idx && (
                                    <div className="p-6 border-t border-gray-100 space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Question</label>
                                            <input
                                                type="text"
                                                value={faq.question || ''}
                                                onChange={(e) => updateFaq(idx, 'question', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:border-gray-900 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Answer</label>
                                            <textarea
                                                value={faq.answer || ''}
                                                onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm resize-none focus:border-gray-900 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {(!safeData.faq || safeData.faq.length === 0) && (
                            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                No FAQ items yet. Click "Add FAQ" to create one.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AMCPlansManager;
