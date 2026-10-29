import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Link2, Eye, EyeOff, MapPin } from 'lucide-react';

const FooterManager = ({ data, onChange }) => {
    const [editingLink, setEditingLink] = useState(null);

    // Safely extract values with defaults
    const {
        companyName = 'UnioTech IT',
        tagline = '',
        email = '',
        phone = '',
        address = '',
        addresses = [],
        quickLinks = [],
        socialLinks = {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
        },
        copyrightText = 'All rights reserved.'
    } = data || {};

    // Initialize addresses from legacy single address if addresses array is empty
    const effectiveAddresses = addresses.length > 0
        ? addresses
        : (address ? [{ label: 'Office', value: address }] : []);

    const updateField = (field, value) => {
        onChange({ ...data, [field]: value });
    };

    const updateSocialLink = (platform, value) => {
        onChange({
            ...data,
            socialLinks: { ...socialLinks, [platform]: value }
        });
    };

    const addQuickLink = () => {
        const newLink = { name: 'New Link', path: '/', visible: true };
        onChange({
            ...data,
            quickLinks: [...quickLinks, newLink]
        });
    };

    const updateQuickLink = (index, field, value) => {
        const updated = [...quickLinks];
        updated[index] = { ...updated[index], [field]: value };
        onChange({ ...data, quickLinks: updated });
    };

    const removeQuickLink = (index) => {
        const updated = quickLinks.filter((_, i) => i !== index);
        onChange({ ...data, quickLinks: updated });
    };

    const toggleLinkVisibility = (index) => {
        const updated = [...quickLinks];
        updated[index] = { ...updated[index], visible: !updated[index].visible };
        onChange({ ...data, quickLinks: updated });
    };

    // Address management functions
    const addAddress = () => {
        const newAddress = { label: 'New Office', value: '' };
        const currentAddresses = effectiveAddresses;
        onChange({
            ...data,
            addresses: [...currentAddresses, newAddress],
            address: '' // Clear legacy single address field
        });
    };

    const updateAddress = (index, field, value) => {
        const updated = [...effectiveAddresses];
        updated[index] = { ...updated[index], [field]: value };
        onChange({
            ...data,
            addresses: updated,
            address: '' // Clear legacy single address field
        });
    };

    const removeAddress = (index) => {
        const updated = effectiveAddresses.filter((_, i) => i !== index);
        onChange({
            ...data,
            addresses: updated,
            address: '' // Clear legacy single address field
        });
    };

    return (
        <div className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => updateField('companyName', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                            placeholder="Your Company Name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
                        <input
                            type="text"
                            value={copyrightText}
                            onChange={(e) => updateField('copyrightText', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                            placeholder="All rights reserved."
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                    <textarea
                        value={tagline}
                        onChange={(e) => updateField('tagline', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all resize-none"
                        placeholder="Your company tagline..."
                    />
                </div>
            </div>

            {/* Contact Info Section */}
            <div className="space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => updateField('email', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                            placeholder="contact@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => updateField('phone', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>
                </div>
            </div>

            {/* Addresses Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        Office Addresses ({effectiveAddresses.length})
                    </h4>
                    <button
                        onClick={addAddress}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all text-sm font-medium"
                    >
                        <Plus size={16} />
                        Add Address
                    </button>
                </div>

                <div className="space-y-3">
                    {effectiveAddresses.map((addr, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl"
                        >
                            <MapPin size={20} className="text-teal-500 mt-2 flex-shrink-0" />
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={addr.label}
                                    onChange={(e) => updateAddress(index, 'label', e.target.value)}
                                    className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none text-sm font-medium"
                                    placeholder="Label (e.g., Main Office)"
                                />
                                <input
                                    type="text"
                                    value={addr.value}
                                    onChange={(e) => updateAddress(index, 'value', e.target.value)}
                                    className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none text-sm"
                                    placeholder="Full address"
                                />
                            </div>
                            <button
                                onClick={() => removeAddress(index)}
                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                title="Delete Address"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {effectiveAddresses.length === 0 && (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="font-medium">No addresses yet</p>
                            <p className="text-sm">Click "Add Address" to add your office locations</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Social Links Section */}
            <div className="space-y-4">
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Social Media Links
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['facebook', 'twitter', 'instagram', 'linkedin'].map((platform) => (
                        <div key={platform}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{platform}</label>
                            <input
                                type="url"
                                value={socialLinks[platform] || ''}
                                onChange={(e) => updateSocialLink(platform, e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                                placeholder={`https://${platform}.com/yourpage`}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Links Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        Quick Links ({quickLinks.length})
                    </h4>
                    <button
                        onClick={addQuickLink}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-medium"
                    >
                        <Plus size={16} />
                        Add Link
                    </button>
                </div>

                <div className="space-y-3">
                    {quickLinks.map((link, index) => (
                        <div
                            key={index}
                            className={`flex items-center gap-3 p-4 bg-white border rounded-xl transition-all ${link.visible === false ? 'opacity-50 border-gray-100' : 'border-gray-200'
                                }`}
                        >
                            <GripVertical size={18} className="text-gray-400 cursor-move flex-shrink-0" />

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={link.name}
                                    onChange={(e) => updateQuickLink(index, 'name', e.target.value)}
                                    className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none text-sm"
                                    placeholder="Link Name"
                                />
                                <div className="flex items-center gap-2">
                                    <Link2 size={16} className="text-gray-400 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={link.path}
                                        onChange={(e) => updateQuickLink(index, 'path', e.target.value)}
                                        className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-gray-900 outline-none text-sm"
                                        placeholder="/path"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => toggleLinkVisibility(index)}
                                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${link.visible === false
                                    ? 'text-gray-400 hover:text-gray-600 bg-gray-100'
                                    : 'text-green-600 hover:text-green-700 bg-green-50'
                                    }`}
                                title={link.visible === false ? 'Show Link' : 'Hide Link'}
                            >
                                {link.visible === false ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>

                            <button
                                onClick={() => removeQuickLink(index)}
                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                title="Delete Link"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    {quickLinks.length === 0 && (
                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <Link2 size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="font-medium">No quick links yet</p>
                            <p className="text-sm">Click "Add Link" to create your first link</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FooterManager;
