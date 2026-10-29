import React, { useState, useEffect } from 'react';
import { Upload, X, Check, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
// import { useAdmin } from '../../context/AdminContext';

import { getApiUrl, apiRequest, uploadFile, getImageUrl } from '../../utils/api';

const ImagePicker = ({ onSelect, onClose, currentImage }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const res = await apiRequest('/api/upload/list');
            const data = await res.json();
            setImages(data);
        } catch (error) {
            // Handle error silently
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await uploadFile('/api/upload/image', formData);

            if (res.ok) {
                const data = await res.json();
                if (data && data.url) {
                    const newImage = {
                        filename: data.filename || `upload_${Date.now()}`,
                        url: data.url,
                        path: data.url
                    };
                    // Prepend new image to local state so it appears instantly
                    setImages(prevImages => [newImage, ...prevImages]);
                } else {
                    fetchImages();
                }
            } else {
                const errData = await res.json();
                alert(`Upload failed: ${errData.error || errData.message || res.statusText}`);
            }
        } catch (error) {
            alert(`Upload error: ${error.message || error}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (filename, e) => {
        e.stopPropagation();
        if (!confirm('Delete this image?')) return;

        try {
            await apiRequest(`/api/upload/${filename}`, {
                method: 'DELETE'
            });
            fetchImages();
        } catch (error) {
            // Handle error silently
        }
    };

    // Helper to resolve image URL
    // We can use the imported getImageUrl directly in the JSX, calling it resolveUrl to avoid naming conflict if we kept the import as getImageUrl
    // Actually we imported getImageUrl, so let's just use that.
    // But wait, the component defines its own getImageUrl function... let's rename the local helper or just remove it if the imported one matches.
    // The imported one handles absolute URLs check too.
    /*
    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('data:')) return url;
        return `${API_BASE.replace('/api', '')}${url}`;
    };
    */
    // We will just use the imported `getImageUrl` in the JSX, so I will remove this local function.

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl w-full max-w-3xl h-[80vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold">Select Image</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-auto flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <label className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-gray-50 hover:border-primary-light transition-colors h-40">
                            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                            {uploading ? (
                                <Loader2 className="animate-spin text-primary-dark mb-2" />
                            ) : (
                                <Upload className="text-gray-400 mb-2" />
                            )}
                            <span className="text-sm text-gray-500 font-medium">Upload New</span>
                        </label>

                        {loading ? (
                            <div className="col-span-full text-center py-10">
                                <Loader2 className="animate-spin mx-auto text-gray-400" />
                            </div>
                        ) : (
                            images.map(img => (
                                <div
                                    key={img.filename}
                                    onClick={() => onSelect(img.url)}
                                    className={`relative group rounded-xl overflow-hidden border-2 cursor-pointer h-40 bg-gray-50 flex items-center justify-center ${currentImage === img.url ? 'border-primary-dark ring-2 ring-primary-light/50' : 'border-gray-100 hover:border-gray-300'
                                        }`}
                                >
                                    <img
                                        src={getImageUrl(img.url)}
                                        alt={img.filename}
                                        className="max-w-full max-h-full object-contain p-2"
                                    />

                                    {currentImage === img.url && (
                                        <div className="absolute top-2 right-2 bg-primary-dark text-white p-1 rounded-full shadow-lg">
                                            <Check size={12} />
                                        </div>
                                    )}

                                    <button
                                        onClick={(e) => handleDelete(img.filename, e)}
                                        className="absolute top-2 right-2 bg-white text-red-500 p-1.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImagePicker;
