import React, { useState } from 'react';
import { Trash2, Plus, Save, Image as ImageIcon, X } from 'lucide-react';
import ImagePicker from './ImagePicker';

const HeroManager = ({ data, onChange }) => {
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [imagePickerTarget, setImagePickerTarget] = useState(null);

    // Ensure data has the correct structure
    const heroData = {
        title: '',
        subtitle: '',
        description: '',
        ctaText: '',
        ctaLink: '',
        backgroundImages: [],
        ...data
    };

    const updateField = (field, value) => {
        onChange({
            ...heroData,
            [field]: value
        });
    };

    const addImage = (url) => {
        const currentImages = heroData.backgroundImages || [];
        if (!currentImages.includes(url)) {
            updateField('backgroundImages', [...currentImages, url]);
        }
    };

    const removeImage = (index) => {
        const currentImages = [...(heroData.backgroundImages || [])];
        currentImages.splice(index, 1);
        updateField('backgroundImages', currentImages);
    };

    const handleImageSelect = (image) => {
        const url = typeof image === 'string' ? image : image.url;
        if (imagePickerTarget === 'backgroundImages') {
            addImage(url);
        } else if (imagePickerTarget) {
            updateField(imagePickerTarget, url);
        }
        setShowImagePicker(false);
        setImagePickerTarget(null);
    };

    return (
        <div className="space-y-8">
            {/* Text Fields Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Hero Title</label>
                    <textarea
                        value={heroData.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all resize-none text-base font-medium"
                        placeholder="Main headline..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Subtitle</label>
                    <input
                        type="text"
                        value={heroData.subtitle}
                        onChange={(e) => updateField('subtitle', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 outline-none"
                    />
                </div>

                <div className="col-span-full">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea
                        value={heroData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 outline-none resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">CTA Button Text</label>
                    <input
                        type="text"
                        value={heroData.ctaText}
                        onChange={(e) => updateField('ctaText', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">CTA Link</label>
                    <input
                        type="text"
                        value={heroData.ctaLink}
                        onChange={(e) => updateField('ctaLink', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-gray-900 outline-none"
                    />
                </div>
            </div>

            {/* Multiple Background Images Section */}
            <div className="pt-8 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h4 className="text-lg font-bold text-gray-800">Background Slideshow</h4>
                        <p className="text-sm text-gray-500">Add multiple images to cycle through them every 30 seconds.</p>
                    </div>
                    <button
                        onClick={() => {
                            setImagePickerTarget('backgroundImages');
                            setShowImagePicker(true);
                        }}
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all active:scale-95 shadow-sm"
                    >
                        <Plus size={16} /> Add Image
                    </button>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {heroData.backgroundImages && heroData.backgroundImages.map((img, index) => (
                        <div key={index} className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm transition-all hover:shadow-md">
                            <img
                                src={img}
                                alt={`Background ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => removeImage(index)}
                                    className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                                    title="Remove Image"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            {/* Badge */}
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded text-[10px] text-white font-bold">
                                #{index + 1}
                            </div>
                        </div>
                    ))}

                    {/* Empty State / Add Placeholder */}
                    {(!heroData.backgroundImages || heroData.backgroundImages.length === 0) && (
                        <button
                            onClick={() => {
                                setImagePickerTarget('backgroundImages');
                                setShowImagePicker(true);
                            }}
                            className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all"
                        >
                            <ImageIcon size={24} />
                            <span className="text-xs font-medium">Add Image</span>
                        </button>
                    )}
                </div>
            </div>

            {showImagePicker && (
                <ImagePicker
                    onSelect={handleImageSelect}
                    onClose={() => {
                        setShowImagePicker(false);
                        setImagePickerTarget(null);
                    }}
                    currentImage={null}
                />
            )}
        </div>
    );
};

export default HeroManager;
