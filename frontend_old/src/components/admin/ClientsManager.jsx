import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Users, Eye, EyeOff } from 'lucide-react';
import ImagePicker from './ImagePicker';

const ClientsManager = ({ data, onChange }) => {
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    // Safely extract values with defaults
    const {
        title = 'Our Valued Clients',
        subtitle = 'Trusted by leading organizations worldwide',
        isVisible = true,
        items = []
    } = data || {};

    const updateField = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const toggleVisibility = () => {
        onChange({ ...data, isVisible: !isVisible });
    };

    const addClient = () => {
        setEditingIndex(-1);
        setShowImagePicker(true);
    };

    const handleImageSelect = (image) => {
        const logoUrl = typeof image === 'string' ? image : image.url;

        if (editingIndex === -1) {
            const newClient = { name: 'New Client', logo: logoUrl };
            onChange({
                ...data,
                items: [...items, newClient]
            });
        } else if (editingIndex !== null) {
            const updated = [...items];
            updated[editingIndex] = { ...updated[editingIndex], logo: logoUrl };
            onChange({ ...data, items: updated });
        }

        setShowImagePicker(false);
        setEditingIndex(null);
    };

    const updateClientName = (index, name) => {
        const updated = [...items];
        updated[index] = { ...updated[index], name };
        onChange({ ...data, items: updated });
    };

    const removeClient = (index) => {
        const updated = items.filter((_, i) => i !== index);
        onChange({ ...data, items: updated });
    };

    const openImagePicker = (index) => {
        setEditingIndex(index);
        setShowImagePicker(true);
    };

    return (
        <div className="space-y-6">
            {/* Header with Visibility Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Users size={24} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                            <p className="text-sm text-gray-500">Total Clients</p>
                        </div>
                    </div>

                    {/* Visibility Toggle */}
                    <button
                        onClick={toggleVisibility}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-medium ${isVisible
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                    >
                        {isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                        {isVisible ? 'Page Visible' : 'Page Hidden'}
                    </button>
                </div>

                <button
                    onClick={addClient}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-medium"
                >
                    <Plus size={18} />
                    Add Client
                </button>
            </div>

            {/* Page Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => updateField('title', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                        placeholder="Our Valued Clients"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Page Subtitle</label>
                    <input
                        type="text"
                        value={subtitle}
                        onChange={(e) => updateField('subtitle', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                        placeholder="Trusted by leading organizations"
                    />
                </div>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((client, index) => (
                    <div
                        key={index}
                        className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                        <div
                            className="relative aspect-[3/2] bg-gray-50 rounded-lg mb-3 overflow-hidden cursor-pointer"
                            onClick={() => openImagePicker(index)}
                        >
                            {client.logo ? (
                                <img
                                    src={client.logo}
                                    alt={client.name}
                                    className="w-full h-full object-contain p-2"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon size={32} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-medium">Change Logo</span>
                            </div>
                        </div>

                        <input
                            type="text"
                            value={client.name}
                            onChange={(e) => updateClientName(index, e.target.value)}
                            className="w-full px-2 py-1 text-sm text-center bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-900 outline-none transition-all"
                            placeholder="Client Name"
                        />

                        <button
                            onClick={() => removeClient(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                            title="Remove Client"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}

                {items.length === 0 && (
                    <div
                        onClick={addClient}
                        className="col-span-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                        <ImageIcon size={40} className="text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No clients added yet</p>
                        <p className="text-sm text-gray-400 mt-1">Click to add your first client</p>
                    </div>
                )}
            </div>

            {/* Image Picker Modal */}
            {showImagePicker && (
                <ImagePicker
                    onSelect={handleImageSelect}
                    onClose={() => {
                        setShowImagePicker(false);
                        setEditingIndex(null);
                    }}
                    currentImage={editingIndex !== null && editingIndex >= 0 ? items[editingIndex]?.logo : null}
                />
            )}
        </div>
    );
};

export default ClientsManager;
