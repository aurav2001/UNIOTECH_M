import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Users, RefreshCw } from 'lucide-react';
import ImagePicker from './ImagePicker';

// Dynamically import all partner logos from local assets
const partnerLogos = import.meta.glob('../../assets/partners/*.png', { eager: true });

// Transform imported modules into a partners array
const staticPartners = Object.entries(partnerLogos).map(([path, module]) => {
    const fileName = path.split('/').pop().replace('.png', '');
    const name = fileName.replace(/_/g, ' ');
    return { name, logo: module.default };
});

const PartnersManager = ({ data, onChange }) => {
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);

    // Safely extract values with defaults
    const {
        title = 'Our Trusted Partners',
        items = []
    } = data || {};

    // Auto-populate from static assets if items is empty
    useEffect(() => {
        if (items.length === 0 && staticPartners.length > 0) {
            // Don't auto-populate, just show the option
        }
    }, [items.length]);

    const updateField = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const loadFromAssets = () => {
        if (window.confirm(`Load ${staticPartners.length} partner logos from local assets? This will replace current partners.`)) {
            onChange({
                ...data,
                items: staticPartners
            });
        }
    };

    const addPartner = () => {
        setEditingIndex(-1); // -1 indicates new partner
        setShowImagePicker(true);
    };

    const handleImageSelect = (image) => {
        const logoUrl = typeof image === 'string' ? image : image.url;

        if (editingIndex === -1) {
            // Adding new partner
            const newPartner = { name: 'New Partner', logo: logoUrl };
            onChange({
                ...data,
                items: [...items, newPartner]
            });
        } else if (editingIndex !== null) {
            // Updating existing partner
            const updated = [...items];
            updated[editingIndex] = { ...updated[editingIndex], logo: logoUrl };
            onChange({ ...data, items: updated });
        }

        setShowImagePicker(false);
        setEditingIndex(null);
    };

    const updatePartnerName = (index, name) => {
        const updated = [...items];
        updated[index] = { ...updated[index], name };
        onChange({ ...data, items: updated });
    };

    const removePartner = (index) => {
        const updated = items.filter((_, i) => i !== index);
        onChange({ ...data, items: updated });
    };

    const openImagePicker = (index) => {
        setEditingIndex(index);
        setShowImagePicker(true);
    };

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Users size={24} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                        <p className="text-sm text-gray-500">Total Partners</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {staticPartners.length > 0 && (
                        <button
                            onClick={loadFromAssets}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-medium"
                            title={`Load ${staticPartners.length} logos from assets folder`}
                        >
                            <RefreshCw size={18} />
                            Load from Assets ({staticPartners.length})
                        </button>
                    )}
                    <button
                        onClick={addPartner}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-medium"
                    >
                        <Plus size={18} />
                        Add Partner
                    </button>
                </div>
            </div>

            {/* Title Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                    placeholder="Our Trusted Partners"
                />
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
                <div>
                    <p className="font-medium text-gray-900">Show Partners Section</p>
                    <p className="text-sm text-gray-500">Toggle visibility of the partners marquee on the homepage</p>
                </div>
                <button
                    onClick={() => updateField('isVisible', data?.isVisible === false ? true : false)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${data?.isVisible === false ? 'bg-gray-300' : 'bg-green-500'}`}
                >
                    <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${data?.isVisible === false ? '' : 'translate-x-6'}`}
                    />
                </button>
            </div>

            {/* Partners Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((partner, index) => (
                    <div
                        key={index}
                        className="group relative bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                        {/* Logo */}
                        <div
                            className="relative aspect-[3/2] bg-gray-50 rounded-lg mb-3 overflow-hidden cursor-pointer"
                            onClick={() => openImagePicker(index)}
                        >
                            {partner.logo ? (
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
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

                        {/* Name Input */}
                        <input
                            type="text"
                            value={partner.name}
                            onChange={(e) => updatePartnerName(index, e.target.value)}
                            className="w-full px-2 py-1 text-sm text-center bg-transparent border-b border-transparent hover:border-gray-200 focus:border-gray-900 outline-none transition-all"
                            placeholder="Partner Name"
                        />

                        {/* Delete Button */}
                        <button
                            onClick={() => removePartner(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                            title="Remove Partner"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                ))}

                {/* Empty State / Add Button */}
                {items.length === 0 && (
                    <div
                        onClick={staticPartners.length > 0 ? loadFromAssets : addPartner}
                        className="col-span-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                        <ImageIcon size={40} className="text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">
                            {staticPartners.length > 0
                                ? `Load ${staticPartners.length} logos from assets`
                                : 'No partners added yet'
                            }
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {staticPartners.length > 0
                                ? 'Click to load from local files'
                                : 'Click to add your first partner'
                            }
                        </p>
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

export default PartnersManager;
