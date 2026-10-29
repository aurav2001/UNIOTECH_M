import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileText, Image, Settings, LogOut, Edit3, Menu, X, ChevronRight, Inbox, Briefcase, BookOpen, RefreshCw, Users } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
            ? 'bg-gray-900 text-white shadow-lg'
            : 'text-gray-600 hover:bg-gray-100'
            }`}
    >
        <Icon size={20} className="shrink-0" />
        {!collapsed && <span className="font-medium truncate">{label}</span>}
    </button>
);

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
    const { logout, userRole, isBlogEditor } = useAdmin();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    // All navigation items with permission requirements
    const allNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'all' },
        { id: 'requests', label: 'Requests', icon: Inbox, permission: 'all' },
        { id: 'client-accounts', label: 'Client Accounts', icon: Users, permission: 'all' },
        { id: 'careers', label: 'Careers', icon: Briefcase, permission: 'all' },
        { id: 'content', label: 'Content', icon: Edit3, permission: 'all' },
        { id: 'navigation', label: 'Navigation', icon: Menu, permission: 'all' },
        { id: 'pages', label: 'Pages', icon: FileText, permission: 'all' },
        { id: 'blogs', label: 'Blogs', icon: BookOpen, permission: 'blogs' },
        { id: 'media', label: 'Media', icon: Image, permission: 'blogs' }, // Blog editor needs media for images
        { id: 'settings', label: 'Settings', icon: Settings, permission: 'all' },
        { id: 'sync', label: 'Sync Content', icon: RefreshCw, permission: 'all' }
    ];

    // Filter nav items based on role
    const navItems = isBlogEditor 
        ? allNavItems.filter(item => item.permission === 'blogs')
        : allNavItems;

    return (
        <div className="flex h-screen w-full bg-gray-100 overflow-hidden relative">

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                        <Settings className="text-white" size={16} />
                    </div>
                    <span className="font-bold text-gray-900 text-sm">Admin Panel</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform"
                >
                    {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMobileMenu}
                        className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                className={`fixed lg:relative inset-y-0 left-0 w-64 bg-white flex flex-col border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out shadow-xl lg:shadow-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                {/* Logo Area */}
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                            <Settings className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 text-sm">Admin Panel</h2>
                            <p className="text-xs text-gray-500">
                                {isBlogEditor ? 'Blog Editor' : 'UnioTech CMS'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeTab === item.id}
                            onClick={() => { setActiveTab(item.id); closeMobileMenu(); }}
                        />
                    ))}
                </nav>

                {/* Logout Section */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden pt-14 lg:pt-0">

                {/* Desktop Header */}
                <div className="hidden lg:flex h-16 items-center justify-between px-8 bg-white border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-gray-900 capitalize">{activeTab.replace('-', ' ')}</h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        System Online
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation (Optional Alternative) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 safe-area-pb">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.slice(0, 4).map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all min-w-[60px] ${activeTab === item.id
                                ? 'text-gray-900 bg-gray-100'
                                : 'text-gray-400'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    ))}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-gray-400 min-w-[60px]"
                    >
                        <Menu size={20} />
                        <span className="text-[10px] font-medium">More</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;