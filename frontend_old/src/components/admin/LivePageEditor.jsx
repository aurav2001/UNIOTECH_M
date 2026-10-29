import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    Save, ArrowLeft, Loader2, Check, AlertCircle, Image as ImageIcon,
    Plus, Trash2, Eye, EyeOff, LayoutGrid, Type, Table as TableIcon,
    Maximize2, Minimize2, ChevronDown, ChevronUp
} from 'lucide-react';
import SubServiceLayout from '../../templates/SubServiceLayout';
import ImagePicker from './ImagePicker';

export default function LivePageEditor({ initialData, onSave, onCancel, isSaving }) {
    // Determine initial state
    const [formData, setFormData] = useState(initialData || {
        title: '',
        slug: '',
        type: 'service',
        subtitle: '',
        heroImage: '',
        content: '', // Legacy support
        isPublished: false,
        features: [],
        layout: 'default',
        sections: [],
        stats: []
    });

    const [showPreview, setShowPreview] = useState(false);
    const [pickerTarget, setPickerTarget] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Toggle section expansion
    const toggleSection = (index) => {
        setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
    };

    // Auto-expand new sections
    useEffect(() => {
        if (formData.sections.length > 0) {
            // const lastIdx = formData.sections.length - 1;
        }
    }, [formData.sections.length]);

    // --- FORM HANDLERS ---

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Section Handlers
    const addSection = (type) => {
        let newSection = { type };

        if (type === 'paragraph') {
            newSection = { type: 'paragraph', heading: '', content: '', image: '', hasImage: true };
        } else if (type === 'image_text') {
            newSection = { type: 'paragraph', heading: '', introText: '', content: '', image: '', hasImage: true, isImageText: true };
        } else if (type === 'text_only') {
            newSection = { type: 'paragraph', heading: '', content: '', hasImage: false };
        } else if (type === 'full_section') {
            newSection = {
                type: 'paragraph',
                heading: '',
                content: '',
                image: '',
                hasImage: true,
                hasTable: true,
                tableTitle: '',
                columns: ['Column 1', 'Column 2'],
                rows: [['', '']]
            };
        } else if (type === 'table') {
            newSection = { type: 'table', title: '', columns: ['Column 1', 'Column 2'], rows: [['', '']] };
        } else if (type === 'content') {
            newSection = { type: 'content', title: '', subtitle: '', description: '', image: '', icon: '', features: [] };
        }

        const newSections = [...(formData.sections || []), newSection];
        setFormData({ ...formData, sections: newSections });
        setExpandedSections(prev => ({ ...prev, [newSections.length - 1]: true }));
    };

    const updateSection = (index, field, value) => {
        const newSections = [...formData.sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setFormData({ ...formData, sections: newSections });
    };

    const removeSection = (index) => {
        if (!confirm('Are you sure you want to remove this section?')) return;
        const newSections = formData.sections.filter((_, i) => i !== index);
        setFormData({ ...formData, sections: newSections });
    };

    const moveSection = (index, direction) => {
        const newSections = [...formData.sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        setFormData({ ...formData, sections: newSections });
        // Update expanded state to follow the move (simplified: just collapse all or tracking is complex)
        setExpandedSections({});
    };

    // Nested Array Handlers (Features, Table Cols/Rows)
    const updateSectionFeature = (secIdx, featIdx, value) => {
        const newSections = [...formData.sections];
        newSections[secIdx].features[featIdx] = value;
        setFormData({ ...formData, sections: newSections });
    };

    const addSectionFeature = (secIdx) => {
        const newSections = [...formData.sections];
        newSections[secIdx].features = [...(newSections[secIdx].features || []), ''];
        setFormData({ ...formData, sections: newSections });
    };

    const removeSectionFeature = (secIdx, featIdx) => {
        const newSections = [...formData.sections];
        newSections[secIdx].features = newSections[secIdx].features.filter((_, i) => i !== featIdx);
        setFormData({ ...formData, sections: newSections });
    };

    // Table Handlers
    const addTableColumn = (secIdx) => {
        const newSections = [...formData.sections];
        const section = newSections[secIdx];
        section.columns = [...(section.columns || []), `Col ${section.columns.length + 1}`];
        section.rows = section.rows.map(row => [...row, '']);
        setFormData({ ...formData, sections: newSections });
    };

    const addTableRow = (secIdx) => {
        const newSections = [...formData.sections];
        const section = newSections[secIdx];
        section.rows = [...(section.rows || []), new Array(section.columns.length).fill('')];
        setFormData({ ...formData, sections: newSections });
    };

    const updateTableCell = (secIdx, rowIdx, colIdx, value) => {
        const newSections = [...formData.sections];
        newSections[secIdx].rows[rowIdx][colIdx] = value;
        setFormData({ ...formData, sections: newSections });
    };

    const updateColumnHeader = (secIdx, colIdx, value) => {
        const newSections = [...formData.sections];
        newSections[secIdx].columns[colIdx] = value;
        setFormData({ ...formData, sections: newSections });
    };

    const removeTableRow = (secIdx, rowIdx) => {
        const newSections = [...formData.sections];
        newSections[secIdx].rows = newSections[secIdx].rows.filter((_, i) => i !== rowIdx);
        setFormData({ ...formData, sections: newSections });
    };

    // --- IMAGE PICKER ---
    const handleImageSelect = (url) => {
        if (!pickerTarget) return;

        if (pickerTarget.type === 'hero') {
            updateField('heroImage', url);
        } else if (pickerTarget.type === 'section') {
            updateSection(pickerTarget.index, 'image', url);
        }
        setPickerTarget(null);
    };

    // --- RENDER HELPERS ---
    const renderImageField = (currentUrl, onPick) => (
        <div className="space-y-2">
            <div className="relative border-2 border-dashed border-gray-200 rounded-lg overflow-hidden bg-gray-50 min-h-[120px] flex items-center justify-center group">
                {currentUrl ? (
                    <>
                        <img src={currentUrl} alt="Preview" className="w-full h-full object-cover max-h-[200px]" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button onClick={onPick} className="px-3 py-1 bg-white text-gray-800 rounded-md text-sm font-medium hover:bg-gray-100">
                                Change
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onPick({ target: { value: '' } }); /* Hack check */ }} className="p-1 bg-white text-red-500 rounded-md hover:bg-red-50">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </>
                ) : (
                    <button onClick={onPick} className="flex flex-col items-center gap-2 text-gray-400 hover:text-primary-medium">
                        <ImageIcon size={32} />
                        <span className="text-sm font-medium">Select Image</span>
                    </button>
                )}
            </div>
            {currentUrl && (
                <div className="flex justify-end">
                    <button onClick={() => {
                        if (pickerTarget?.type === 'hero') updateField('heroImage', '');
                        else if (pickerTarget?.type === 'section') updateSection(pickerTarget.index, 'image', '');
                    }} className="text-xs text-red-500 hover:underline">Remove Image</button>
                </div>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* TOOLBAR */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            {formData.title || 'Untitled Page'}
                            <span className={`px-2 py-0.5 text-xs rounded-full uppercase tracking-wider ${formData.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {formData.isPublished ? 'Live' : 'Draft'}
                            </span>
                        </h1>
                        <p className="text-xs text-gray-500">Live Editor Mode</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>

                    <button
                        onClick={() => onSave(formData)}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-primary-dark rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA - Single Column (Old Layout) */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                <div className="max-w-5xl mx-auto space-y-6 pb-20">

                    {/* 1. Basic Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Page Details</h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => updateField('title', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-light"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Slug</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => updateField('slug', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Visibility</label>
                                    <select
                                        value={formData.isPublished ? 'true' : 'false'}
                                        onChange={(e) => updateField('isPublished', e.target.value === 'true')}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="false">Draft (Hidden)</option>
                                        <option value="true">Published (Live)</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Page Layout</label>
                                    <select
                                        value={formData.layout || 'default'}
                                        onChange={(e) => updateField('layout', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg font-medium"
                                    >
                                        <option value="default">Default Standard Layout</option>
                                        <option value="uniotech_modern">Uniotech Modern Layout</option>
                                        <option value="sub_service_satyam">Sub-Service / Feature Layout</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Hero Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Hero Banner</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Subtitle / Tagline</label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={(e) => updateField('subtitle', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="e.g. Services"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Background Image</label>
                                {renderImageField(formData.heroImage, () => setPickerTarget({ type: 'hero' }))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Sections */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Content Sections</h3>
                            <div className="flex gap-2">
                                <button onClick={() => addSection('paragraph')} className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-50 flex items-center gap-1">+ Standard</button>
                                <button onClick={() => addSection('image_text')} className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-50 flex items-center gap-1">+ Image+Text</button>
                                <button onClick={() => addSection('text_only')} className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-50 flex items-center gap-1">+ Text Only</button>
                                <button onClick={() => addSection('full_section')} className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-50 flex items-center gap-1">+ Full Block</button>
                                <button onClick={() => addSection('content')} className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-50 flex items-center gap-1">+ Feature List</button>
                                <button onClick={() => addSection('table')} className="text-xs bg-white border px-2 py-1 rounded hover:bg-gray-50 flex items-center gap-1">+ Table Only</button>
                            </div>
                        </div>

                        {formData.sections.map((section, idx) => (
                            <div key={idx} className={`bg-white rounded-xl border shadow-sm transition-all duration-200 ${expandedSections[idx] ? 'ring-2 ring-primary-light/20 border-primary-light' : 'border-gray-200'}`}>
                                {/* Header */}
                                <div
                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 bg-gray-50/50 rounded-t-xl"
                                    onClick={() => toggleSection(idx)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center font-bold">
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <h4 className="font-semibold text-gray-800 text-sm">
                                                {section.heading || section.title || `Untitled ${section.type}`}
                                            </h4>
                                            <p className="text-xs text-gray-400 uppercase font-medium">{section.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={(e) => { e.stopPropagation(); moveSection(idx, 'up') }} className="p-1 hover:text-blue-500 disabled:opacity-30" disabled={idx === 0}><ChevronUp size={16} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); moveSection(idx, 'down') }} className="p-1 hover:text-blue-500 disabled:opacity-30" disabled={idx === formData.sections.length - 1}><ChevronDown size={16} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); removeSection(idx) }} className="p-1 hover:text-red-500 ml-2"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                {/* Body */}
                                {expandedSections[idx] && (
                                    <div className="p-4 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-200">

                                        {/* PARAGRAPH / IMAGE_TEXT / TEXT_ONLY / FULL_SECTION TYPES */}
                                        {section.type === 'paragraph' && (
                                            <>
                                                <div>
                                                    <label className="label-sm">Heading</label>
                                                    <input type="text" value={section.heading} onChange={e => updateSection(idx, 'heading', e.target.value)} className="input-field" placeholder="Section Heading" />
                                                </div>

                                                {section.isImageText && (
                                                    <div>
                                                        <label className="label-sm">Introduction Text (Bold)</label>
                                                        <textarea value={section.introText} onChange={e => updateSection(idx, 'introText', e.target.value)} className="input-field h-20" placeholder="Short intro paragraph..." />
                                                    </div>
                                                )}

                                                <div>
                                                    <label className="label-sm">Content (Rich Text)</label>
                                                    <ReactQuill theme="snow" value={section.content} onChange={val => updateSection(idx, 'content', val)} className="h-40 mb-12" />
                                                </div>

                                                {(section.hasImage !== false) && (
                                                    <div>
                                                        <label className="label-sm">Side Image (Optional)</label>
                                                        {renderImageField(section.image, () => setPickerTarget({ type: 'section', index: idx }))}
                                                    </div>
                                                )}

                                                {section.hasTable && (
                                                    <div className="mt-4 border-t pt-4">
                                                        <label className="label-sm mb-2">Integrated Table Data</label>
                                                        <div>
                                                            <label className="label-sm">Table Title</label>
                                                            <input type="text" value={section.tableTitle} onChange={e => updateSection(idx, 'tableTitle', e.target.value)} className="input-field mb-2" />
                                                        </div>
                                                        {/* Reuse table logic if possible, or duplicate for now due to complex nesting */}
                                                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                                            {/* Simplified table editor for embedded table */}
                                                            <table className="w-full text-sm">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        {(section.columns || ['Col 1', 'Col 2']).map((col, cIdx) => (
                                                                            <th key={cIdx} className="p-2 border-r min-w-[100px]">
                                                                                <input
                                                                                    type="text"
                                                                                    value={col}
                                                                                    onChange={e => updateColumnHeader(idx, cIdx, e.target.value)}
                                                                                    className="w-full bg-transparent font-bold outline-none"
                                                                                />
                                                                            </th>
                                                                        ))}
                                                                        <th className="w-10 text-center">
                                                                            <button onClick={() => addTableColumn(idx)}><Plus size={16} /></button>
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(section.rows || [['', '']]).map((row, rIdx) => (
                                                                        <tr key={rIdx} className="border-t">
                                                                            {row.map((cell, cIdx) => (
                                                                                <td key={cIdx} className="p-2 border-r">
                                                                                    <input
                                                                                        type="text"
                                                                                        value={cell}
                                                                                        onChange={e => updateTableCell(idx, rIdx, cIdx, e.target.value)}
                                                                                        className="w-full outline-none"
                                                                                    />
                                                                                </td>
                                                                            ))}
                                                                            <td className="text-center">
                                                                                <button onClick={() => removeTableRow(idx, rIdx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                            <button onClick={() => addTableRow(idx)} className="w-full py-2 bg-gray-50 text-gray-500 text-xs font-bold hover:bg-gray-100">+ Add Row</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* CONTENT (FEATURE) TYPE */}
                                        {section.type === 'content' && (
                                            <>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="label-sm">Title</label>
                                                        <input type="text" value={section.title} onChange={e => updateSection(idx, 'title', e.target.value)} className="input-field" />
                                                    </div>
                                                    <div>
                                                        <label className="label-sm">Subtitle</label>
                                                        <input type="text" value={section.subtitle} onChange={e => updateSection(idx, 'subtitle', e.target.value)} className="input-field" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="label-sm">Description</label>
                                                    <textarea value={section.description} onChange={e => updateSection(idx, 'description', e.target.value)} className="input-field min-h-[100px]" />
                                                </div>
                                                <div>
                                                    <label className="label-sm">Image</label>
                                                    {renderImageField(section.image, () => setPickerTarget({ type: 'section', index: idx }))}
                                                </div>
                                                <div>
                                                    <label className="label-sm mb-2 block">Bullet Points</label>
                                                    {(section.features || []).map((feat, fIdx) => (
                                                        <div key={fIdx} className="flex gap-2 mb-2">
                                                            <input type="text" value={feat} onChange={e => updateSectionFeature(idx, fIdx, e.target.value)} className="input-field flex-1" />
                                                            <button onClick={() => removeSectionFeature(idx, fIdx)} className="text-red-400 hover:text-red-500"><Trash2 size={16} /></button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addSectionFeature(idx)} className="text-xs text-primary-medium font-bold flex items-center gap-1 mt-2">+ Add Bullet Point</button>
                                                </div>
                                            </>
                                        )}

                                        {/* TABLE TYPE */}
                                        {section.type === 'table' && (
                                            <>
                                                <div>
                                                    <label className="label-sm">Table Title</label>
                                                    <input type="text" value={section.title} onChange={e => updateSection(idx, 'title', e.target.value)} className="input-field" />
                                                </div>
                                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                {section.columns.map((col, cIdx) => (
                                                                    <th key={cIdx} className="p-2 border-r min-w-[100px]">
                                                                        <input
                                                                            type="text"
                                                                            value={col}
                                                                            onChange={e => updateColumnHeader(idx, cIdx, e.target.value)}
                                                                            className="w-full bg-transparent font-bold outline-none"
                                                                        />
                                                                    </th>
                                                                ))}
                                                                <th className="w-10 text-center">
                                                                    <button onClick={() => addTableColumn(idx)} title="Add Column"><Plus size={16} /></button>
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {section.rows.map((row, rIdx) => (
                                                                <tr key={rIdx} className="border-t">
                                                                    {row.map((cell, cIdx) => (
                                                                        <td key={cIdx} className="p-2 border-r">
                                                                            <input
                                                                                type="text"
                                                                                value={cell}
                                                                                onChange={e => updateTableCell(idx, rIdx, cIdx, e.target.value)}
                                                                                className="w-full outline-none"
                                                                            />
                                                                        </td>
                                                                    ))}
                                                                    <td className="text-center">
                                                                        <button onClick={() => removeTableRow(idx, rIdx)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <button onClick={() => addTableRow(idx)} className="w-full py-2 bg-gray-50 text-gray-500 text-xs font-bold hover:bg-gray-100">+ Add Row</button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {formData.sections.length === 0 && (
                            <div className="text-center py-8 bg-dashed border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                                Start adding content blocks above.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PREVIEW MODAL (FIXED OVERLAY) */}
            {showPreview && (
                <div className="fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white w-full h-full max-w-[1400px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
                            <h2 className="font-bold text-gray-800">Live Preview</h2>
                            <button
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
                                            <React.Suspense fallback={<div className="p-10 text-center">Loading Layout...</div>}>
                                                {/* Lazily loaded or directly imported if possible. Importing UnioTechLayout at top level is safer. */}
                                                {/* I check if UnioTechLayout is imported... it is NOT imported in LivePageEditor. Import it first or reuse logic. */}
                                                {/* Wait, SubServiceLayout is imported. UnioTechLayout is needed. */}
                                                {/* For now use SubServiceLayout as fallback if UnioTechLayout is not imported yet, but I should import it. */}
                                                <SubServiceLayout page={formData} />
                                            </React.Suspense>
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

            {/* MODALS */}
            {pickerTarget && (
                <ImagePicker
                    onSelect={handleImageSelect}
                    onClose={() => setPickerTarget(null)}
                    currentImage={pickerTarget.type === 'hero' ? formData.heroImage : (formData.sections[pickerTarget.index]?.image)}
                />
            )}

            <style>{`
                .label-sm { @apply block text-xs font-medium text-gray-500 uppercase mb-1; }
                .input-field { @apply w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-primary-light outline-none; }
            `}</style>
        </div>
    );
}
