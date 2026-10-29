import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, ExternalLink, Image as ImageIcon, Loader2, Edit2, Calendar, Clock, Lock, Globe, Eye, EyeOff, X, User, Facebook, Twitter, Linkedin, Copy, Share2, ThumbsUp, MessageCircle, Bookmark, Check, ChevronRight } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import { useAdmin } from '../../context/AdminContext';
import { getApiUrl, apiRequest, uploadFile } from '../../utils/api';
import { motion, useScroll, useSpring } from 'framer-motion'; // Added for preview

const BlogsManager = () => {
    // const { token } = useAdmin();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('list'); // 'list' | 'edit' | 'create'
    const [editingBlog, setEditingBlog] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Initial state for new blog
    const initialBlogState = {
        title: '',
        slug: '',
        subtitle: '',
        coverImage: '',
        content: '',
        isPublished: false,
        tags: [],
        readTime: '5 min read',
        author: {
            name: 'UnioTech Team',
            image: ''
        },
        seo: {
            title: '',
            description: '',
            keywords: ''
        }
    };

    const [formData, setFormData] = useState(initialBlogState);
    const [tagInput, setTagInput] = useState('');

    // Reference Blog Constant
    const referenceBlog = {
        _id: 'reference-template',
        id: 'reference-template',
        title: "The Future of Minimalist Design in Dark Mode Interfaces",
        slug: "your-blog-post",
        subtitle: "Exploring how deep navy palettes enhance user focus, reduce eye strain, and create a premium digital experience.",
        author: {
            name: "Alex Rivera",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070",
            bio: "Lead Designer"
        },
        readTime: "8 min read",
        coverImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070",
        content: `
            <p class="text-xl leading-relaxed mb-8 font-light italic text-gray-600">
                Design is not just what it looks like and feels like. Design is how it works. Especially when we dive into the depths of dark mode, where every pixel must justify its existence against the void.
            </p>
            <p class="mb-6 leading-8">
                As we move further into 2024, the "Dark Navy" aesthetic—specifically hex code <code>#0B1120</code>—has emerged as the gold standard for high-end SaaS platforms and editorial blogs. Unlike pure black, which can create jarring contrast and "ghosting" effects on OLED screens, dark navy provides a soft, atmospheric backdrop that feels sophisticated and easy on the eyes.
            </p>
            <h2 class="text-2xl font-bold mt-12 mb-6 text-gray-900">Why Navy is the New Black</h2>
            <p class="mb-6 leading-8">
                Pure black (#000000) often feels heavy and flat. By introducing a subtle blue hue, designers can create a sense of depth and space. This "atmospheric" design approach allows elements like cards and buttons to use slightly lighter shades of navy to indicate elevation without relying on heavy drop shadows.
            </p>
            <blockquote>
                "The goal of dark mode isn't just to invert colors; it's to re-architect the visual hierarchy for a low-light environment."
            </blockquote>
            <h3 class="text-xl font-bold mt-10 mb-4 text-gray-900">Optimal Readability Tips</h3>
            <ul class="list-disc pl-6 space-y-3 mb-8">
                <li>Maintain a minimum contrast ratio of 7:1 for body text.</li>
                <li>Avoid pure white (#FFFFFF) for text; use slightly off-white (#E2E8F0) to reduce glare.</li>
                <li>Increase letter spacing (tracking) slightly for light-on-dark text.</li>
                <li>Use 1.6x to 1.8x line-height for long-form content.</li>
            </ul>
            <p class="mb-12 leading-8">
                In conclusion, the shift towards dark navy interfaces represents a maturation of digital design. It’s no longer about just "looking cool"—it's about creating ergonomic, beautiful, and functional spaces where users can focus on what truly matters: the content.
            </p>
        `,
        tags: ["DesignSystems", "DarkMode", "UIUX", "Typography"],
        isPublished: false, // Ensure it opens as draft
        createdAt: new Date().toISOString(),
        seo: {
            title: "The Future of Minimalist Design in Dark Mode Interfaces",
            description: "Detailed analysis of dark navy UI trends and accessibility standards.",
            keywords: "Design, UI/UX, Dark Mode, Minimalist"
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await apiRequest('/api/blogs?all=true');
            const data = await res.json();
            if (Array.isArray(data)) {
                // Prepend Reference Blog to the list locally
                setBlogs([referenceBlog, ...data]);
            } else {
                setBlogs([referenceBlog]); // Fallback with at least reference
                console.error('API returned non-array:', data);
            }
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setFormData(initialBlogState);
        setEditingBlog(null);
        setView('create');
    };

    const handleEdit = (blog) => {
        // If it's the reference blog, treat it as a fresh content template
        if (blog.id === 'reference-template') {
            setFormData({
                ...initialBlogState,
                ...blog,
                id: undefined, // Remove ID so it saves as new
                _id: undefined,
                isPublished: false, // Reset publish status
                slug: 'your-new-blog-slug', // Reset slug
                title: 'Copy of ' + blog.title
            });
            setEditingBlog(null); // Ensure it's treated as new creation
        } else {
            setFormData({
                ...initialBlogState,
                ...blog,
                tags: blog.tags || [],
                author: blog.author || { name: 'UnioTech Team', image: '' },
                seo: blog.seo || { title: '', description: '', keywords: '' }
            });
            setEditingBlog(blog);
        }
        setView('edit');
    };

    const handleDelete = async (id) => {
        // Prevent deleting the reference template
        if (id === 'reference-template') {
            alert('Cannot delete the reference template. This is just a sample blog for reference.');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this blog post?')) return;

        try {
            const res = await apiRequest(`/api/blogs/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchBlogs();
            } else {
                const errorData = await res.json();
                alert('Failed to delete: ' + (errorData.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Failed to delete blog:', error);
            alert('Failed to delete blog. Please try again.');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        try {
            const res = await uploadFile('/api/upload/image', uploadFormData);

            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, coverImage: data.url }));
            }
        } catch (error) {
            alert('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const endpoint = editingBlog
                ? `/api/blogs/${editingBlog.id || editingBlog._id}`
                : '/api/blogs';

            const method = editingBlog ? 'PUT' : 'POST';

            const res = await apiRequest(endpoint, {
                method,
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                await fetchBlogs();
                setView('list');
            } else {
                alert(data.error || 'Failed to save blog');
            }
        } catch (error) {
            alert('Failed to save blog');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, tagInput.trim()]
                }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    if (view === 'list') {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Blogs Manager</h2>
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={20} />
                        Create New Post
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading blogs...</div>
                ) : (
                    <div className="grid gap-4">
                        {blogs.map(blog => (
                            <div key={blog.id || blog._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center group hover:border-blue-500 transition-all">
                                <div className="flex gap-4 items-center">
                                    {(blog.coverImage || blog.image) && (
                                        <img src={blog.coverImage || blog.image} alt={blog.title} className="w-16 h-16 object-cover rounded-lg" />
                                    )}
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{blog.title}</h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${blog.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {blog.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {blog.id === 'reference-template' ? 'Template' : new Date(blog.createdAt).toLocaleDateString()}
                                            </span>
                                            {blog.id === 'reference-template' ? (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">REFERENCE</span>
                                            ) : (
                                                <code className="text-xs bg-gray-100 px-1 rounded">/{blog.slug}</code>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {blog.isPublished && (
                                        <a
                                            href={`/blogs/${blog.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                            title="View Live"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleEdit(blog)}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    {(blog.id !== 'reference-template' && blog._id !== 'reference-template') && (
                                        <button
                                            onClick={() => handleDelete(blog.id || blog._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {blogs.length === 0 && (
                            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                No blog posts found. Click "Create New Post" to start.
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 flex items-center gap-4 border-b border-gray-100 py-4 justify-between -mx-6 px-6 shadow-sm mb-6 transition-all">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView('list')}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {view === 'create' ? 'Create New Post' : 'Edit Post'}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                    >
                        {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                    <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <input
                            type="checkbox"
                            checked={formData.isPublished}
                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                        />
                        <span className={`text-sm font-medium ${formData.isPublished ? 'text-green-600' : 'text-gray-500'}`}>
                            {formData.isPublished ? 'Published' : 'Draft Mode'}
                        </span>
                    </label>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Post
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-200 focus:border-gray-900 outline-none text-lg font-medium"
                                placeholder="Enter blog title"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Subtitle / Excerpt</label>
                            <textarea
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-200 focus:border-gray-900 outline-none h-20 resize-none"
                                placeholder="Short description for list view..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Content</label>
                            <div className="prose-sm max-w-none">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={(value) => setFormData({ ...formData, content: value })}
                                    className="bg-white rounded-lg h-96 mb-12"
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            ['link', 'image'],
                                            ['clean']
                                        ]
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Cover Image */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-3">Cover Image</label>
                        <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors group">
                            {formData.coverImage ? (
                                <>
                                    <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <p className="text-white font-medium text-sm">Click remove to change</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={32} className="mb-2" />
                                    <span className="text-sm">Upload Cover Image</span>
                                </>
                            )}

                            {uploadingImage && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <Loader2 size={24} className="animate-spin text-gray-900" />
                                </div>
                            )}

                            {!formData.coverImage && (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            )}
                        </div>
                        {formData.coverImage && (
                            <button
                                onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                                className="mt-2 text-sm text-red-500 hover:text-red-700 hover:underline"
                            >
                                Remove Image
                            </button>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                        <h3 className="font-bold text-gray-900 pb-2 border-b">Metadata</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                                placeholder="auto-generated-from-title"
                            />
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
                        <input
                            type="text"
                            value={formData.author.name}
                            onChange={(e) => setFormData({ ...formData, author: { ...formData.author, name: e.target.value } })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Author Avatar</label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 group shrink-0">
                                {formData.author.image ? (
                                    <img src={formData.author.image} alt="Author" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                                        <User size={20} />
                                    </div>
                                )}

                                {/* Overlay for upload */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <label className="cursor-pointer w-full h-full flex items-center justify-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;

                                                const uploadData = new FormData();
                                                uploadData.append('image', file);

                                                try {
                                                    const res = await uploadFile('/api/upload/image', uploadData);
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            author: { ...prev.author, image: data.url }
                                                        }));
                                                    }
                                                } catch (err) {
                                                    alert('Failed to upload avatar');
                                                }
                                            }}
                                        />
                                        <Edit2 size={16} className="text-white" />
                                    </label>
                                </div>
                            </div>

                            {formData.author.image && (
                                <button
                                    onClick={() => setFormData(prev => ({ ...prev, author: { ...prev.author, image: '' } }))}
                                    className="text-xs text-red-500 hover:underline"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Read Time</label>
                        <input
                            type="text"
                            value={formData.readTime}
                            onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {formData.tags.map(tag => (
                                <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs flex items-center gap-1">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="hover:text-red-500"><Trash2 size={10} /></button>
                                    <X size={12} className="cursor-pointer" onClick={() => removeTag(tag)} />
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                            placeholder="Type and press Enter to add tag"
                        />
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                        <h3 className="font-bold text-gray-900 pb-2 border-b flex items-center gap-2">
                            <Globe size={18} /> SEO Settings
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                            <input
                                type="text"
                                value={formData.seo?.title || ''}
                                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, title: e.target.value } })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                placeholder={formData.title || "SEO Title"}
                            />
                            <p className="text-xs text-gray-400 mt-1">Leave blank to use blog title.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                            <textarea
                                value={formData.seo?.description || ''}
                                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, description: e.target.value } })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm h-20"
                                placeholder={formData.subtitle || "Brief summary for search results..."}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                            <input
                                type="text"
                                value={formData.seo?.keywords || ''}
                                onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, keywords: e.target.value } })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                                placeholder="technology, ai, cloud (comma separated)"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- PREVIEW MODAL --- */}
            {
                showPreview && (
                    <div className="fixed inset-0 z-[60] bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-6">
                        <div className="bg-white w-full h-full max-w-[1400px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            {/* Modal Header */}
                            <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
                                <h2 className="font-bold text-gray-800">Live Preview</h2>
                                <button
                                    type="button"
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
                                            {window.location.host}/blogs/{formData.slug || 'your-blog-post'}
                                        </div>
                                    </div>

                                    {/* Preview Content - Matching Exactly BlogDetail.jsx */}
                                    <div className="flex-1 overflow-y-auto bg-slate-50 relative">

                                        {/* Mock Reading Progress Bar */}
                                        <div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 z-[100] w-1/3"></div>

                                        <main className="relative pt-24 md:pt-32 pb-20">
                                            {/* Sticky Social Bar (Desktop Mock) */}
                                            <div className="hidden lg:flex flex-col gap-4 fixed left-[calc(50%-540px)] top-40 z-30">
                                                <button className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
                                                    <Share2 size={18} />
                                                </button>
                                                <button className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm">
                                                    <ThumbsUp size={18} />
                                                </button>
                                            </div>

                                            <div className="max-w-[800px] mx-auto px-6">
                                                {/* Hero Header */}
                                                <div className="mb-10">
                                                    {(formData.coverImage) && (
                                                        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-10 shadow-lg border border-gray-100">
                                                            <img
                                                                src={formData.coverImage}
                                                                alt={formData.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col gap-4">
                                                        <span className="text-blue-600 font-bold text-sm tracking-widest uppercase">
                                                            {formData.tags?.[0] || 'Technology'}
                                                        </span>
                                                        <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-gray-900">
                                                            {formData.title || 'Blog Title'}
                                                        </h1>
                                                        {formData.subtitle && (
                                                            <p className="text-xl text-slate-500 font-normal leading-relaxed mt-2">
                                                                {formData.subtitle}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Profile Header */}
                                                    <div className="flex items-center gap-4 mt-8 py-6 border-y border-slate-200">
                                                        <div className="h-12 w-12 rounded-full ring-2 ring-blue-600/20 overflow-hidden bg-gray-100">
                                                            <img src={formData.author?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e5e7eb'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%239ca3af' font-size='40'%3E?%3C/text%3E%3C/svg%3E"} alt="Author" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-bold text-gray-900 leading-none">{formData.author?.name || 'UnioTech Team'}</p>
                                                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                                                <span>{formData.author?.bio || 'Editor'}</span>
                                                                <span>•</span>
                                                                <span>{new Date().toLocaleDateString()}</span>
                                                                <span>•</span>
                                                                <span>{formData.readTime || '5 min read'}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Article Body */}
                                                <article className="prose prose-slate max-w-none md:prose-lg 
                                                    prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
                                                    prose-p:text-slate-600 prose-p:leading-[1.8] prose-p:text-[1.1rem]
                                                    prose-a:text-blue-600 prose-a:no-underline prose-a:font-semibold hover:prose-a:underline
                                                    prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:font-medium prose-blockquote:text-gray-800
                                                    prose-img:rounded-xl prose-img:shadow-md prose-img:border prose-img:border-gray-100 prose-img:my-10"
                                                    style={{ hyphens: 'none', WebkitHyphens: 'none' }}
                                                >
                                                    <div
                                                        className="ql-editor blog-content"
                                                        style={{ hyphens: 'none', WebkitHyphens: 'none', wordBreak: 'normal' }}
                                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.content) }}
                                                    />
                                                </article>

                                                {/* Tags */}
                                                {formData.tags && formData.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 pt-8 border-t border-slate-200 mt-12 mb-20">
                                                        {formData.tags.map(tag => (
                                                            <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                            </div>
                                        </main>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default BlogsManager;
