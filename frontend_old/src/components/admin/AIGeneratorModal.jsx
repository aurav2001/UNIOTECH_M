import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Image as ImageIcon, Loader2, ArrowRight } from 'lucide-react';
import { generatePageContent } from '../../utils/aiGenerator';
import { uploadFile } from '../../utils/api';
import { useAdmin } from '../../context/AdminContext';

const AIGeneratorModal = ({ isOpen, onClose, onGenerate }) => {
    // const { token } = useAdmin();
    // Default to env var or local storage
    const [rawText, setRawText] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Input, 2: Processing

    if (!isOpen) return null;

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        setError('');

        try {
            const newUrls = [];
            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);

                const res = await uploadFile('/api/upload/image', formData);

                const data = await res.json();
                if (data.success) {
                    newUrls.push(data.url);
                }
            }
            setUploadedImages(prev => [...prev, ...newUrls]);
        } catch (err) {
            setError('Failed to upload images');
        } finally {
            setIsUploading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            const generatedData = await generatePageContent(rawText, uploadedImages);
            onGenerate(generatedData);
            onClose();
        } catch (err) {
            setError(err.message || 'Generation failed');
            setStep(1);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex justify-between items-center text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Sparkles size={24} className="text-yellow-300" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Magic Content Generator</h2>
                                <p className="text-blue-100 text-xs">Powered by Google Gemini AI</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 overflow-y-auto flex-2 space-y-6">
                        {step === 1 ? (
                            <>
                                {/* Raw Text Input */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">


                                    {/* Raw Text Input */}
                                    <div className="flex flex-col">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Raw Content Source</label>
                                        <textarea
                                            value={rawText}
                                            onChange={(e) => setRawText(e.target.value)}
                                            className="w-full flex-1 min-h-[300px] px-4 py-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50 focus:bg-white transition-colors leading-relaxed"
                                            placeholder="Paste your unstructured text here. e.g., 'We offer cloud services involving migration, aws setup...'"
                                        />
                                        <p className="text-xs text-gray-400 mt-2 text-right">{rawText.length} characters</p>
                                    </div>

                                    {/* Image Upload */}
                                    <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-4">Context Images</label>

                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            {uploadedImages.map((url, idx) => (
                                                <div key={idx} className="aspect-square rounded-lg border border-gray-200 overflow-hidden relative group">
                                                    <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            ))}

                                            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors bg-white hover:bg-blue-50">
                                                {isUploading ? (
                                                    <Loader2 size={24} className="animate-spin" />
                                                ) : (
                                                    <>
                                                        <ImageIcon size={24} className="mb-2" />
                                                        <span className="text-[10px] font-bold uppercase">Upload</span>
                                                    </>
                                                )}
                                                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                            </label>
                                        </div>

                                        <div className="bg-blue-50 text-blue-700 text-xs p-4 rounded-lg flex items-start gap-2">
                                            <Sparkles size={14} className="mt-0.5 shrink-0" />
                                            <p>Upload images to help the AI understand your visual context. It will intelligently place them in the layout.</p>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-pulse">
                                        {error}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Sparkles size={24} className="text-purple-500 animate-pulse" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Architecting Content...</h3>
                                    <p className="text-gray-500 text-sm mt-2">Analyzing text related images and structuring layout.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {step === 1 && (
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || isUploading}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? 'Generating...' : 'Generate Page'}
                                {!isGenerating && <ArrowRight size={18} />}
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AIGeneratorModal;
