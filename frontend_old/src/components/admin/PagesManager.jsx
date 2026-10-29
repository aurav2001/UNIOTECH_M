import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, MoreHorizontal, ExternalLink, Image as ImageIcon, Loader2, Table, FileText, LayoutList, Eye, EyeOff } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useAdmin } from '../../context/AdminContext';
import { getApiUrl, apiRequest, uploadFile } from '../../utils/api';
// Import Layouts for Preview
import SubServiceLayout from '../../templates/SubServiceLayout';
import UnioTechLayout from '../../templates/UnioTechLayout';

const PagesManager = () => {
    const { isAuthenticated } = useAdmin();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' | 'edit' | 'create'
    const [editingPage, setEditingPage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingHero, setUploadingHero] = useState(false);
    const [uploadingSectionIdx, setUploadingSectionIdx] = useState(null);

    // Preview State
    const [showPreview, setShowPreview] = useState(false);

    // Initial state for new page
    const initialPageState = {
        title: '',
        slug: '',
        type: 'service',
        subtitle: '',
        heroImage: '',
        content: '',
        isPublished: true,
        features: [],
        layout: 'default',
        sections: [],
        stats: [],
        sidebarTitle: '',
        sidebarContent: '',
        ctaAction: 'link',
        ctaValue: ''
    };

    const [formData, setFormData] = useState(initialPageState);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const res = await apiRequest('/api/pages?all=true');
            const data = await res.json();
            setPages(data);
        } catch (error) {
            // Handle error silently
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setFormData(initialPageState);
        setEditingPage(null);
        setView('create');
    };

    const handleEdit = (page) => {
        setFormData({
            ...page,
            features: page.features || [],
            layout: page.layout || 'default',
            sections: page.sections || [],
            stats: page.stats || []
        });
        setEditingPage(page);
        setView('edit');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this page?')) return;

        try {
            const res = await apiRequest(`/api/pages/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchPages();
            }
        } catch (error) {
            // Handle error silently
        }
    };

    // Quick toggle visibility without entering edit mode
    const handleToggleVisibility = async (page) => {
        try {
            const res = await apiRequest(`/api/pages/${page.id || page._id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...page, isPublished: !page.isPublished })
            });

            if (res.ok) {
                fetchPages();
            }
        } catch (error) {
            // Handle error silently
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadingHero(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await uploadFile('/api/upload/image', formData);

            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, heroImage: data.url }));
            }
        } catch (error) {
            alert('Failed to upload image');
        } finally {
            setUploadingHero(false);
        }
    };

    // Handle section image upload
    const handleSectionImageUpload = async (event, sectionIndex) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadingSectionIdx(sectionIndex);
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        try {
            const res = await uploadFile('/api/upload/image', uploadFormData);

            const data = await res.json();
            if (data.success) {
                updateSection(sectionIndex, 'image', data.url);
            } else {
                alert('Failed to upload image');
            }
        } catch (error) {
            alert('Failed to upload image');
        } finally {
            setUploadingSectionIdx(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const endpoint = editingPage
                ? `/api/pages/${editingPage.id || editingPage._id}`
                : '/api/pages';

            const method = editingPage ? 'PUT' : 'POST';

            const res = await apiRequest(endpoint, {
                method,
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await fetchPages();
                setView('list');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save page');
            }
        } catch (error) {
            alert('Failed to save page');
        } finally {
            setIsSaving(false);
        }
    };

    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, { title: '', description: '', icon: '' }]
        }));
    };

    const updateFeature = (index, field, value) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = { ...newFeatures[index], [field]: value };
        setFormData(prev => ({ ...prev, features: newFeatures }));
    };

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    // --- Dynamic Section Helpers ---
    const addSection = (type = 'content') => {
        let newSection = { type };

        if (type === 'content') {
            newSection = {
                type: 'content',
                title: '',
                subtitle: '',
                description: '',
                image: '',
                icon: '',
                features: []
            };
        } else if (type === 'paragraph') {
            newSection = {
                type: 'paragraph',
                heading: '',
                content: '',
                image: '',
                introText: '',
                features: []
            };
        } else if (type === 'table') {
            newSection = {
                type: 'table',
                title: '',
                columns: ['Column 1', 'Column 2'],
                rows: [['', '']]
            };
        }

        setFormData(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }));
    };

    const updateSection = (index, field, value) => {
        const newSections = [...formData.sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const removeSection = (index) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index)
        }));
    };

    // Section feature helpers
    const addSectionFeature = (sectionIndex) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].features = [...(newSections[sectionIndex].features || []), ''];
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const updateSectionFeature = (sectionIndex, featureIndex, value) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].features[featureIndex] = value;
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const removeSectionFeature = (sectionIndex, featureIndex) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].features = newSections[sectionIndex].features.filter((_, i) => i !== featureIndex);
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    // --- Table Section Helpers ---
    const addTableColumn = (sectionIndex) => {
        const newSections = [...formData.sections];
        const section = newSections[sectionIndex];
        section.columns = [...(section.columns || []), `Column ${section.columns.length + 1}`];
        section.rows = section.rows.map(row => [...row, '']);
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const removeTableColumn = (sectionIndex, colIndex) => {
        const newSections = [...formData.sections];
        const section = newSections[sectionIndex];
        if (section.columns.length <= 1) return;
        section.columns = section.columns.filter((_, i) => i !== colIndex);
        section.rows = section.rows.map(row => row.filter((_, i) => i !== colIndex));
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const updateColumnHeader = (sectionIndex, colIndex, value) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].columns[colIndex] = value;
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const addTableRow = (sectionIndex) => {
        const newSections = [...formData.sections];
        const section = newSections[sectionIndex];
        const newRow = new Array(section.columns.length).fill('');
        section.rows = [...(section.rows || []), newRow];
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const removeTableRow = (sectionIndex, rowIndex) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].rows = newSections[sectionIndex].rows.filter((_, i) => i !== rowIndex);
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    const updateTableCell = (sectionIndex, rowIndex, colIndex, value) => {
        const newSections = [...formData.sections];
        newSections[sectionIndex].rows[rowIndex][colIndex] = value;
        setFormData(prev => ({ ...prev, sections: newSections }));
    };

    // --- Stats Helpers ---
    const addStat = () => {
        setFormData(prev => ({
            ...prev,
            stats: [...prev.stats, { value: '', label: '' }]
        }));
    };

    const updateStat = (index, field, value) => {
        const newStats = [...formData.stats];
        newStats[index] = { ...newStats[index], [field]: value };
        setFormData(prev => ({ ...prev, stats: newStats }));
    };

    const removeStat = (index) => {
        setFormData(prev => ({
            ...prev,
            stats: prev.stats.filter((_, i) => i !== index)
        }));
    };

    if (view === 'list') {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Pages Manager</h2>
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-primary-dark text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={20} />
                        Create New Page
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading pages...</div>
                ) : (
                    <div className="grid gap-4">
                        {pages.map(page => (
                            <div key={page.id || page._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-blue-500 transition-all">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-gray-900">{page.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${page.type === 'service' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {page.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <code>/{page.slug}</code>
                                        <a href={`/services/${page.slug}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {/* Visibility Toggle - Always Visible */}
                                    <label className="flex items-center gap-2 cursor-pointer" title={page.isPublished ? 'Page is visible' : 'Page is hidden'}>
                                        <span className={`text-xs font-medium ${page.isPublished ? 'text-green-600' : 'text-gray-400'}`}>
                                            {page.isPublished ? 'Live' : 'Draft'}
                                        </span>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={page.isPublished}
                                            onClick={() => handleToggleVisibility(page)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${page.isPublished ? 'bg-green-500' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${page.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </label>

                                    {/* Edit/Delete - Show on Hover */}
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(page)}
                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="Edit"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(page.id || page._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {pages.length === 0 && (
                            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                No pages created yet. Click "Create New Page" to start.
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Edit/Create Form
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView('list')}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {view === 'create' ? 'Create New Page' : 'Edit Page'}
                    </h2>
                </div>
                {/* PREVIEW BUTTON */}
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                >
                    {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl relative">
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-light focus:border-transparent"
                                placeholder="e.g. Cloud Solutions"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-light focus:border-transparent bg-gray-50"
                                placeholder="auto-generated-from-title"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from title</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Page Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-light focus:border-transparent"
                            >
                                <option value="service">Service Page</option>
                                <option value="reference">Reference / Case Study</option>
                                <option value="other">Other Page</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Layout Template</label>
                            <select
                                value={formData.layout || 'default'}
                                onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-light focus:border-transparent font-medium text-gray-900"
                            >
                                <option value="default">Default Standard Layout</option>
                                <option value="uniotech_modern">Uniotech Modern Layout</option>
                                <option value="sub_service_satyam">Sub-Services Layout By Satyam</option>
                            </select>
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isPublished}
                                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-primary-dark focus:ring-primary-light"
                                />
                                <span className="text-gray-700 font-medium">Publish Page</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Hero Section</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle / Tagline</label>
                        <input
                            type="text"
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-light focus:border-transparent"
                            placeholder="A short description that appears below the title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hero Background Image</label>
                        {/* Large Responsive Image Preview Frame */}
                        <div className="w-full max-w-xl bg-gray-100 overflow-hidden border-2 border-gray-300 relative mb-4">
                            {formData.heroImage ? (
                                <div className="p-4 flex items-center justify-center min-h-[200px] max-h-[400px]">
                                    <img
                                        src={formData.heroImage}
                                        alt="Hero"
                                        className="max-w-full max-h-[360px] w-auto h-auto object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-gray-400 gap-3">
                                    <ImageIcon size={48} strokeWidth={1.5} />
                                    <span className="text-sm font-medium">No Image Uploaded</span>
                                    <span className="text-xs">Upload an image to see preview</span>
                                </div>
                            )}
                            {uploadingHero && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-white" size={32} />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="inline-block">
                                <span className="bg-primary-dark text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm">
                                    {formData.heroImage ? 'Change Image' : 'Upload Image'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </label>
                            {formData.heroImage && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, heroImage: '' }))}
                                    className="text-red-500 hover:text-red-600 text-sm font-medium hover:underline"
                                >
                                    Remove Image
                                </button>
                            )}
                            <p className="text-xs text-gray-500">Recommended: 1920x1080px | JPG, PNG, WEBP</p>
                        </div>
                    </div>
                </div>

                {/* Main Content - Available for ALL layouts */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-lg font-bold text-gray-900">Main Content</h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Visible on page body</span>
                    </div>
                    {(formData.layout !== 'sub_service_satyam' && formData.layout !== 'uniotech_modern') && (
                        <div className="prose-sm">
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                onChange={(value) => setFormData({ ...formData, content: value })}
                                className="bg-white rounded-lg"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        ['link', 'clean']
                                    ]
                                }}
                            />
                            <p className="text-xs text-gray-500 mt-1">Use toolbar for formatting.</p>
                        </div>
                    )}
                </div>

                {/* Features Section - ONLY FOR DEFAULT LAYOUT */}
                {(formData.layout === 'default' || !formData.layout) && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-lg font-bold text-gray-900">Features / Key Points</h3>
                            <button
                                type="button"
                                onClick={addFeature}
                                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                            >
                                <Plus size={14} /> Add Feature
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.features.map((feature, idx) => (
                                <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(idx)}
                                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="grid gap-3">
                                        <input
                                            type="text"
                                            value={feature.title}
                                            onChange={(e) => updateFeature(idx, 'title', e.target.value)}
                                            placeholder="Feature Title"
                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium"
                                        />
                                        <textarea
                                            value={feature.description}
                                            onChange={(e) => updateFeature(idx, 'description', e.target.value)}
                                            placeholder="Feature Description"
                                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-sm h-20 resize-none"
                                        />
                                    </div>
                                </div>
                            ))}
                            {formData.features.length === 0 && (
                                <div className="text-center text-gray-500 text-sm py-4">
                                    No features added yet.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- DYNAMIC LAYOUT EDITORS --- */}
                {(formData.layout === 'sub_service_satyam') && (
                    <>
                        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                                <h3 className="text-lg font-bold text-blue-900">Sub-Service Content Sections</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => addSection('content')}
                                        className="text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                                    >
                                        <LayoutList size={14} /> Content
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addSection('paragraph')}
                                        className="text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 flex items-center gap-1"
                                    >
                                        <FileText size={14} /> Paragraph
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => addSection('table')}
                                        className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 flex items-center gap-1"
                                    >
                                        <Table size={14} /> Table
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {formData.sections.map((section, idx) => (
                                    <div
                                        key={idx}
                                        className={`p-6 rounded-xl border relative ${section.type === 'paragraph' ? 'bg-green-50/50 border-green-200' :
                                            section.type === 'table' ? 'bg-purple-50/50 border-purple-200' :
                                                'bg-blue-50/50 border-blue-100'
                                            }`}
                                    >
                                        {/* Section Type Badge & Delete Button */}
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${section.type === 'paragraph' ? 'bg-green-200 text-green-800' :
                                                section.type === 'table' ? 'bg-purple-200 text-purple-800' :
                                                    'bg-blue-200 text-blue-800'
                                                }`}>
                                                {section.type === 'paragraph' && <><FileText size={12} className="inline mr-1" />Paragraph</>}
                                                {section.type === 'table' && <><Table size={12} className="inline mr-1" />Table</>}
                                                {(!section.type || section.type === 'content') && <><LayoutList size={12} className="inline mr-1" />Content</>}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeSection(idx)}
                                                className="text-gray-400 hover:text-red-500 p-1"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {/* === CONTENT SECTION EDITOR === */}
                                        {(!section.type || section.type === 'content') && (
                                            <div className="grid gap-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input
                                                        type="text"
                                                        value={section.title || ''}
                                                        onChange={(e) => updateSection(idx, 'title', e.target.value)}
                                                        placeholder="Section Title (e.g. Global Procurement)"
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={section.subtitle || ''}
                                                        onChange={(e) => updateSection(idx, 'subtitle', e.target.value)}
                                                        placeholder="Subtitle (e.g. Sourcing without borders)"
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                                    />
                                                </div>
                                                <textarea
                                                    value={section.description || ''}
                                                    onChange={(e) => updateSection(idx, 'description', e.target.value)}
                                                    placeholder="Description..."
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm h-24"
                                                />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Section Image Upload */}
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-bold text-gray-500 mb-2">Section Image</label>
                                                        <div className="w-full max-w-md bg-gray-100 overflow-hidden border-2 border-gray-300 relative mb-3">
                                                            {section.image ? (
                                                                <div className="p-3 flex items-center justify-center min-h-[120px] max-h-[250px]">
                                                                    <img
                                                                        src={section.image}
                                                                        alt="Section"
                                                                        className="max-w-full max-h-[220px] w-auto h-auto object-contain"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="h-32 flex flex-col items-center justify-center text-gray-400 gap-2">
                                                                    <ImageIcon size={32} strokeWidth={1.5} />
                                                                    <span className="text-xs font-medium">No Image</span>
                                                                </div>
                                                            )}
                                                            {uploadingSectionIdx === idx && (
                                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                    <Loader2 className="animate-spin text-white" size={24} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <label className="cursor-pointer">
                                                                <span className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                                                    {uploadingSectionIdx === idx ? (
                                                                        <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                                                                    ) : (
                                                                        <><ImageIcon size={14} /> {section.image ? 'Change Image' : 'Upload Image'}</>
                                                                    )}
                                                                </span>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleSectionImageUpload(e, idx)}
                                                                    className="hidden"
                                                                    disabled={uploadingSectionIdx === idx}
                                                                />
                                                            </label>
                                                            {section.image && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => updateSection(idx, 'image', '')}
                                                                    className="text-red-500 hover:text-red-600 text-sm font-medium hover:underline"
                                                                >
                                                                    Remove
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={section.icon || ''}
                                                        onChange={(e) => updateSection(idx, 'icon', e.target.value)}
                                                        placeholder="Lucide Icon Name (e.g. Globe, Cpu)"
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono"
                                                    />
                                                </div>

                                                {/* Nested Features */}
                                                <div className="pl-4 border-l-2 border-blue-200">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Bullet Points</label>
                                                    {(section.features || []).map((feat, fIdx) => (
                                                        <div key={fIdx} className="flex gap-2 mb-2">
                                                            <input
                                                                value={feat}
                                                                onChange={(e) => updateSectionFeature(idx, fIdx, e.target.value)}
                                                                className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded"
                                                                placeholder="Feature point..."
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSectionFeature(idx, fIdx)}
                                                                className="text-red-400 hover:text-red-600"
                                                            ><Trash2 size={14} /></button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => addSectionFeature(idx)}
                                                        className="text-xs text-blue-600 font-medium hover:underline"
                                                    >
                                                        + Add Bullet Point
                                                    </button>
                                                </div>

                                                {/* "Learn More" Expandable Section Content (Optional Overrides) */}
                                                <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-black text-blue-900 uppercase tracking-wider">
                                                            Expanded "Learn More Details" Box (Optional Overrides)
                                                        </label>
                                                        <span className="text-[10px] text-blue-600 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                                                            Leave blank for auto-generated defaults
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                        <div className="md:col-span-2">
                                                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Big Heading / Title</label>
                                                            <input
                                                                type="text"
                                                                value={section.detailedHeading || ''}
                                                                onChange={(e) => updateSection(idx, 'detailedHeading', e.target.value)}
                                                                placeholder="e.g. Firewall AMC & Managed Security — 24/7 Threat Protection"
                                                                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm bg-white font-bold text-gray-900"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[11px] font-bold text-gray-700 mb-1">Badge Tag</label>
                                                            <input
                                                                type="text"
                                                                value={section.detailedBadge || ''}
                                                                onChange={(e) => updateSection(idx, 'detailedBadge', e.target.value)}
                                                                placeholder="e.g. Enterprise Solution"
                                                                className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm bg-white font-semibold text-gray-900"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Detailed Paragraph 1 (Overview, Engineering & Architecture)</label>
                                                        <textarea
                                                            value={section.detailedDescription || ''}
                                                            onChange={(e) => updateSection(idx, 'detailedDescription', e.target.value)}
                                                            placeholder="Custom Detailed Paragraph 1..."
                                                            className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm bg-white h-20"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-gray-700 mb-1">Detailed Paragraph 2 (Security, Remote Access & SLA)</label>
                                                        <textarea
                                                            value={section.additionalInfo || ''}
                                                            onChange={(e) => updateSection(idx, 'additionalInfo', e.target.value)}
                                                            placeholder="Custom Detailed Paragraph 2..."
                                                            className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm bg-white h-16"
                                                        />
                                                    </div>

                                                    {/* 4 Feature Highlights Grid */}
                                                    <div className="pt-2 border-t border-blue-200/60">
                                                        <label className="block text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-2">
                                                            4 Key Highlight Badges (Optional Custom Text)
                                                        </label>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            <input
                                                                type="text"
                                                                value={section.highlight1 || ''}
                                                                onChange={(e) => updateSection(idx, 'highlight1', e.target.value)}
                                                                placeholder="Badge 1 (e.g. 24/7 Monitoring & Rapid SLA)"
                                                                className="px-3 py-1.5 rounded-lg border border-blue-200 text-xs bg-white text-gray-800"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={section.highlight2 || ''}
                                                                onChange={(e) => updateSection(idx, 'highlight2', e.target.value)}
                                                                placeholder="Badge 2 (e.g. Dedicated Certified Engineers)"
                                                                className="px-3 py-1.5 rounded-lg border border-blue-200 text-xs bg-white text-gray-800"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={section.highlight3 || ''}
                                                                onChange={(e) => updateSection(idx, 'highlight3', e.target.value)}
                                                                placeholder="Badge 3 (e.g. Full Compliance & Data Security)"
                                                                className="px-3 py-1.5 rounded-lg border border-blue-200 text-xs bg-white text-gray-800"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={section.highlight4 || ''}
                                                                onChange={(e) => updateSection(idx, 'highlight4', e.target.value)}
                                                                placeholder="Badge 4 (e.g. Seamless Integration & Support)"
                                                                className="px-3 py-1.5 rounded-lg border border-blue-200 text-xs bg-white text-gray-800"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* === PARAGRAPH SECTION EDITOR === */}
                                        {section.type === 'paragraph' && (
                                            <div className="grid gap-4">
                                                <input
                                                    type="text"
                                                    value={section.heading || ''}
                                                    onChange={(e) => updateSection(idx, 'heading', e.target.value)}
                                                    placeholder="Heading (e.g. About Our Services)"
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-lg font-bold"
                                                />

                                                {/* Paragraph Image Upload */}
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-2">Side Image (Optional)</label>
                                                    <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                                                        <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center overflow-hidden shrink-0">
                                                            {section.image ? (
                                                                <img src={section.image} alt="Preview" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <ImageIcon size={20} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <label className="cursor-pointer">
                                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                                                                        {uploadingSectionIdx === idx ? (
                                                                            <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                                                                        ) : (
                                                                            <><ImageIcon size={14} /> {section.image ? 'Change' : 'Upload Image'}</>
                                                                        )}
                                                                    </span>
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={(e) => handleSectionImageUpload(e, idx)}
                                                                        className="hidden"
                                                                        disabled={uploadingSectionIdx === idx}
                                                                    />
                                                                </label>
                                                                {section.image && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateSection(idx, 'image', '')}
                                                                        className="text-red-500 hover:text-red-600 text-sm font-medium hover:underline"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">Appears next to the text on Satyam Layout.</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white">
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={section.content || ''}
                                                        onChange={(value) => updateSection(idx, 'content', value)}
                                                        modules={{
                                                            toolbar: [
                                                                [{ 'header': [3, 4, false] }],
                                                                ['bold', 'italic', 'underline'],
                                                                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                                ['link', 'clean']
                                                            ]
                                                        }}
                                                        className="h-64 mb-10" // Extra margin for toolbar
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* === TABLE SECTION EDITOR === */}
                                        {section.type === 'table' && (
                                            <div className="grid gap-4">
                                                <input
                                                    type="text"
                                                    value={section.title || ''}
                                                    onChange={(e) => updateSection(idx, 'title', e.target.value)}
                                                    placeholder="Table Title (e.g. Pricing Comparison)"
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-lg font-bold"
                                                />

                                                {/* Column Headers */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Columns</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => addTableColumn(idx)}
                                                            className="text-xs text-purple-600 font-medium hover:underline flex items-center gap-1"
                                                        >
                                                            <Plus size={12} /> Add Column
                                                        </button>
                                                    </div>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {(section.columns || []).map((col, colIdx) => (
                                                            <div key={colIdx} className="flex items-center gap-1 bg-purple-100 rounded-lg p-1">
                                                                <input
                                                                    type="text"
                                                                    value={col}
                                                                    onChange={(e) => updateColumnHeader(idx, colIdx, e.target.value)}
                                                                    className="px-2 py-1 text-sm font-medium border-0 bg-transparent focus:ring-0 w-28"
                                                                    placeholder={`Column ${colIdx + 1}`}
                                                                />
                                                                {section.columns.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeTableColumn(idx, colIdx)}
                                                                        className="text-red-400 hover:text-red-600 p-1"
                                                                    >
                                                                        <Trash2 size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Table Rows */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rows</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => addTableRow(idx)}
                                                            className="text-xs text-purple-600 font-medium hover:underline flex items-center gap-1"
                                                        >
                                                            <Plus size={12} /> Add Row
                                                        </button>
                                                    </div>
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border-collapse">
                                                            <thead>
                                                                <tr className="bg-purple-200">
                                                                    {(section.columns || []).map((col, colIdx) => (
                                                                        <th key={colIdx} className="px-3 py-2 text-left text-xs font-bold text-purple-800 border border-purple-300">
                                                                            {col}
                                                                        </th>
                                                                    ))}
                                                                    <th className="w-10 border border-purple-300"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {(section.rows || []).map((row, rowIdx) => (
                                                                    <tr key={rowIdx} className="bg-white hover:bg-purple-50">
                                                                        {(row || []).map((cell, cellIdx) => (
                                                                            <td key={cellIdx} className="border border-gray-200 p-0">
                                                                                <input
                                                                                    type="text"
                                                                                    value={cell}
                                                                                    onChange={(e) => updateTableCell(idx, rowIdx, cellIdx, e.target.value)}
                                                                                    className="w-full px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-purple-400"
                                                                                    placeholder="..."
                                                                                />
                                                                            </td>
                                                                        ))}
                                                                        <td className="border border-gray-200 text-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeTableRow(idx, rowIdx)}
                                                                                className="text-red-400 hover:text-red-600 p-1"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    {(section.rows || []).length === 0 && (
                                                        <p className="text-center text-gray-400 text-sm py-4">No rows added yet. Click "Add Row" to start.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {formData.sections.length === 0 && (
                                    <div className="text-center text-gray-500 text-sm py-8 border-2 border-dashed border-gray-200 rounded-xl">
                                        No sections added yet. Use the buttons above to add Content, Paragraph, or Table sections.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-bold text-gray-900">Statistics Bar</h3>
                                <button
                                    type="button"
                                    onClick={addStat}
                                    className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                                >
                                    <Plus size={14} /> Add Stat
                                </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {formData.stats.map((stat, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
                                        <button
                                            type="button"
                                            onClick={() => removeStat(idx)}
                                            className="absolute top-1 right-1 text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <input
                                            type="text"
                                            value={stat.value}
                                            onChange={(e) => updateStat(idx, 'value', e.target.value)}
                                            placeholder="Value (e.g. 50+)"
                                            className="w-full mb-2 font-bold text-lg bg-transparent border-none p-0 focus:ring-0"
                                        />
                                        <input
                                            type="text"
                                            value={stat.label}
                                            onChange={(e) => updateStat(idx, 'label', e.target.value)}
                                            placeholder="Label"
                                            className="w-full text-xs text-gray-500 uppercase tracking-wider bg-transparent border-none p-0 focus:ring-0"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* --- UNIOTECH MODERN EDITOR --- */}
                {formData.layout === 'uniotech_modern' && (
                    <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                            <h3 className="text-lg font-bold text-blue-900">Uniotech Layout Configuration</h3>
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={() => addSection('paragraph')} className="text-sm bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 flex items-center gap-1"><FileText size={14} /> Add Content Section</button>
                                <button type="button" onClick={() => addSection('table')} className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 flex items-center gap-1"><Table size={14} /> Add Table</button>
                            </div>
                        </div>

                        {/* Sidebar & CTA Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-800 border-b pb-2">Sidebar Settings</h4>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sidebar Title</label>
                                    <input type="text" value={formData.sidebarTitle || ''} onChange={(e) => setFormData({ ...formData, sidebarTitle: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="e.g. Quick Info" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sidebar Content</label>
                                    <textarea value={formData.sidebarContent || ''} onChange={(e) => setFormData({ ...formData, sidebarContent: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm h-24" placeholder="Optional custom content..." />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-800 border-b pb-2">CTA Action</h4>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Action Type</label>
                                    <select value={formData.ctaAction || 'link'} onChange={(e) => setFormData({ ...formData, ctaAction: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                                        <option value="link">Navigate to Link</option>
                                        <option value="whatsapp">WhatsApp Chat</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Action Value</label>
                                    <input type="text" value={formData.ctaValue || ''} onChange={(e) => setFormData({ ...formData, ctaValue: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder={formData.ctaAction === 'whatsapp' ? 'Phone number (e.g. 919810443288)' : 'URL or Path (e.g. /contact)'} />
                                </div>
                            </div>
                        </div>

                        {/* Sections List */}
                        <div className="space-y-6">
                            {formData.sections.map((section, idx) => (
                                <div key={idx} className={`p-6 rounded-xl border relative ${section.type === 'table' ? 'bg-purple-50/50 border-purple-200' : 'bg-green-50/50 border-green-200'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${section.type === 'table' ? 'bg-purple-200 text-purple-800' : 'bg-green-200 text-green-800'}`}>
                                            {section.type === 'table' ? <><Table size={12} className="inline mr-1" />Table Section</> : <><FileText size={12} className="inline mr-1" />Content Section</>}
                                        </span>
                                        <button type="button" onClick={() => removeSection(idx)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={18} /></button>
                                    </div>

                                    {/* Paragraph / Content Editor */}
                                    {(section.type === 'paragraph' || !section.type) && (
                                        <div className="grid gap-4">
                                            <input type="text" value={section.heading || ''} onChange={(e) => updateSection(idx, 'heading', e.target.value)} placeholder="Section Heading" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-lg font-bold" />

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Intro Text (Optional)</label>
                                                <ReactQuill theme="snow" value={section.introText || ''} onChange={(value) => updateSection(idx, 'introText', value)} modules={{ toolbar: [['bold', 'italic', 'link'], ['clean']] }} className="bg-white" />
                                            </div>

                                            <div className="mt-8">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Main Content</label>
                                                <ReactQuill theme="snow" value={section.content || ''} onChange={(value) => updateSection(idx, 'content', value)} modules={{ toolbar: [[{ 'header': [3, false] }], ['bold', 'italic', 'underline', 'strike'], [{ 'list': 'ordered' }, { 'list': 'bullet' }], ['link', 'clean']] }} className="bg-white h-48 mb-12" />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-2">Floating Image</label>
                                                    <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                                                        <div className="w-20 h-20 bg-gray-100 rounded border flex items-center justify-center overflow-hidden shrink-0">
                                                            {section.image ? <img src={section.image} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-gray-400" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                                                                {uploadingSectionIdx === idx ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />} {section.image ? 'Change' : 'Upload'}
                                                                <input type="file" accept="image/*" onChange={(e) => handleSectionImageUpload(e, idx)} className="hidden" disabled={uploadingSectionIdx === idx} />
                                                            </label>
                                                            {section.image && <button type="button" onClick={() => updateSection(idx, 'image', '')} className="text-red-500 text-xs ml-3 hover:underline">Remove</button>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key Features List</label>
                                                    {(section.features || []).map((feat, fIdx) => (
                                                        <div key={fIdx} className="flex gap-2 mb-2">
                                                            <input value={feat} onChange={(e) => updateSectionFeature(idx, fIdx, e.target.value)} className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded" placeholder="Feature point..." />
                                                            <button type="button" onClick={() => removeSectionFeature(idx, fIdx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                        </div>
                                                    ))}
                                                    <button type="button" onClick={() => addSectionFeature(idx)} className="text-xs text-blue-600 font-medium hover:underline">+ Add Feature</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {section.type === 'table' && (
                                        <div className="grid gap-4">
                                            <input type="text" value={section.title || ''} onChange={(e) => updateSection(idx, 'title', e.target.value)} placeholder="Table Title" className="w-full px-4 py-3 rounded-lg border border-gray-200 text-lg font-bold" />
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Columns</label>
                                                    <button type="button" onClick={() => addTableColumn(idx)} className="text-xs text-purple-600 font-medium hover:underline flex items-center gap-1"><Plus size={12} /> Add Column</button>
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    {(section.columns || []).map((col, colIdx) => (
                                                        <div key={colIdx} className="flex items-center gap-1 bg-purple-100 rounded-lg p-1">
                                                            <input type="text" value={col} onChange={(e) => updateColumnHeader(idx, colIdx, e.target.value)} className="px-2 py-1 text-sm font-medium border-0 bg-transparent focus:ring-0 w-28" />
                                                            {section.columns.length > 1 && <button type="button" onClick={() => removeTableColumn(idx, colIdx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={12} /></button>}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rows</label>
                                                    <button type="button" onClick={() => addTableRow(idx)} className="text-xs text-purple-600 font-medium hover:underline flex items-center gap-1"><Plus size={12} /> Add Row</button>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse">
                                                        <thead><tr className="bg-purple-200">{(section.columns || []).map((col, colIdx) => (<th key={colIdx} className="px-3 py-2 text-left text-xs font-bold text-purple-800 border border-purple-300">{col}</th>))}<th className="w-10 border border-purple-300"></th></tr></thead>
                                                        <tbody>{(section.rows || []).map((row, rowIdx) => (<tr key={rowIdx} className="bg-white hover:bg-purple-50">{(row || []).map((cell, cellIdx) => (<td key={cellIdx} className="border border-gray-200 p-0"><input type="text" value={cell} onChange={(e) => updateTableCell(idx, rowIdx, cellIdx, e.target.value)} className="w-full px-3 py-2 text-sm border-0 focus:ring-1 focus:ring-purple-400" /></td>))}<td className="border border-gray-200 text-center"><button type="button" onClick={() => removeTableRow(idx, rowIdx)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button></td></tr>))}</tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {formData.sections.length === 0 && <div className="text-center text-gray-500 text-sm py-8 border-2 border-dashed border-gray-200 rounded-xl">No sections added yet. Click "Add Content Section" to start.</div>}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 sticky bottom-6 bg-white/90 backdrop-blur pb-6 z-20">
                    <button
                        type="button"
                        onClick={() => setView('list')}
                        className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors bg-white shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-xl bg-primary-dark text-white font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Page
                    </button>
                </div>

                {/* --- PREVIEW MODAL --- */}
                {showPreview && (
                    <div className="fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-6">
                        <div className="bg-white w-full h-full max-w-[1400px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
                                <h2 className="font-bold text-gray-800">Live Preview</h2>
                                <button
                                    type="button" // Important so it doesn't trigger form submit
                                    onClick={() => setShowPreview(false)}
                                    className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Close Preview
                                </button>
                            </div>

                            {/* Device Frame */}
                            <div className="flex-1 bg-gray-100 p-4 overflow-hidden flex items-center justify-center">
                                <div className="bg-white shadow-xl w-full h-full rounded-lg overflow-hidden flex flex-col border border-gray-300">
                                    {/* Mock Browser Bar */}
                                    <div className="h-8 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2 shrink-0">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                        </div>
                                        <div className="flex-1 text-center text-xs text-gray-400 truncate mx-4 bg-white rounded py-0.5 shadow-sm border border-gray-100">
                                            {window.location.host}/{formData.slug || 'your-page'}
                                        </div>
                                    </div>

                                    {/* Preview Content */}
                                    <div className="flex-1 overflow-y-auto bg-white">
                                        <div className="min-h-full">
                                            {/* Dynamically render preview based on layout */}
                                            {formData.layout === 'uniotech_modern' ? (
                                                <UnioTechLayout page={formData} />
                                            ) : (
                                                <SubServiceLayout page={formData} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default PagesManager;
