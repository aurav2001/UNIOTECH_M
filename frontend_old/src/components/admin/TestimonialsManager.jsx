import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, User, Upload, Loader2 } from 'lucide-react';
// import { useAdmin } from '../../context/AdminContext';
import { uploadFile, getImageUrl } from '../../utils/api';

const TestimonialsManager = ({ data, onChange }) => {
    // const { token } = useAdmin();
    const safeData = data || { title: '', subtitle: '', items: [] };
    const [editingItem, setEditingItem] = useState(null);
    const [uploadingIndex, setUploadingIndex] = useState(null);

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
            author: 'New Author',
            role: 'Job Title',
            quote: 'Amazing service!',
            stat: '100%',
            statDesc: 'Satisfaction',
            avatar: ''
        };
        onChange({ ...safeData, items: [...(safeData.items || []), newItem] });
        setEditingItem(safeData.items ? safeData.items.length : 0);
    };

    const deleteItem = (index) => {
        if (!confirm('Delete this testimonial?')) return;
        const newItems = safeData.items.filter((_, i) => i !== index);
        onChange({ ...safeData, items: newItems });
    };

    const handleFileUpload = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingIndex(index);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await uploadFile('/api/upload/image', formData);

            const data = await res.json();

            if (res.ok) {
                // Cloudinary returns the full URL in data.url
                updateItem(index, 'avatar', data.url);
            } else {
                alert('Upload failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Upload failed.');
        } finally {
            setUploadingIndex(null);
        }
    };

    // Helper to resolve image URL
    // We already imported getImageUrl, so let's use that one or if we want to keep using this local name we can wrap it.
    // The imported function is smart and handles http/data urls.
    // But since the rendered component calls getAvatarUrl(item.avatar), we can just make it alias:
    const getAvatarUrl = getImageUrl;

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Testimonials Section Details</h3>
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

            {/* Testimonials List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Testimonials List</h3>
                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors text-sm font-bold"
                    >
                        <Plus size={16} />
                        Add Testimonial
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
                                    {item.avatar ? (
                                        <img src={getAvatarUrl(item.avatar)} alt={item.author} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User size={16} className="text-gray-500" />
                                        </div>
                                    )}
                                    <span className="font-bold text-gray-900">{item.author || 'Unknown Author'}</span>
                                    <span className="text-sm text-gray-500">- {item.role}</span>
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
                                    {/* Avatar Picker (Direct Upload) */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2">User Avatar</label>
                                        <div className="flex items-center gap-4">
                                            {item.avatar && (
                                                <img
                                                    src={getAvatarUrl(item.avatar)}
                                                    alt="Preview"
                                                    className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                                                />
                                            )}

                                            <label className="cursor-pointer px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                                                {uploadingIndex === index ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Upload size={16} />
                                                )}
                                                {uploadingIndex === index ? 'Uploading...' : 'Change Avatar'}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(index, e)}
                                                    disabled={uploadingIndex === index}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Author Name</label>
                                            <input
                                                type="text"
                                                value={item.author || ''}
                                                onChange={(e) => updateItem(index, 'author', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Role / Job Title</label>
                                            <input
                                                type="text"
                                                value={item.role || ''}
                                                onChange={(e) => updateItem(index, 'role', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Quote</label>
                                        <textarea
                                            value={item.quote || ''}
                                            onChange={(e) => updateItem(index, 'quote', e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Stat (e.g. 50%)</label>
                                            <input
                                                type="text"
                                                value={item.stat || ''}
                                                onChange={(e) => updateItem(index, 'stat', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">Stat Description</label>
                                            <input
                                                type="text"
                                                value={item.statDesc || ''}
                                                onChange={(e) => updateItem(index, 'statDesc', e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm"
                                            />
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

export default TestimonialsManager;
