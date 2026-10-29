import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AdminProvider } from './context/AdminContext';
import { ContentProvider } from './context/ContentContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import JoinUs from './pages/JoinUs';
import Footer from './components/Footer';
import StickyCTA from './components/StickyCTA';
import AdminPanel from './components/AdminPanel';
import ServicePage from './templates/ServicePage';
import DynamicPage from './pages/DynamicPage';
import PricingPage from './pages/PricingPage';
import PlanDetailsPage from './pages/PlanDetailsPage';
import MaintenancePage from './pages/MaintenancePage';
import OurClientsPage from './pages/OurClientsPage';
import OurPartnersPage from './pages/OurPartnersPage';
import Blogs from './pages/Blogs';
import AMCPlansPage from './pages/AMCPlansPage';
import BlogDetail from './pages/BlogDetail';
import NotFound from './pages/NotFound';
import RippleEffect from './components/RippleEffect';
import Support from './pages/Support';
import { ClientProvider } from './context/ClientContext';
import ClientPortal from './pages/ClientPortal';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`relative min-h-screen bg-white ${!isAdminRoute ? 'shadow-[inset_0_0_50px_rgba(0,0,0,0.02)] sm:shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] sm:p-[22px]' : ''} selection:bg-[#4ade80] selection:text-primary-dark`}>
      {/* Global Ripple Effect on Click/Tap */}
      <RippleEffect />

      {/* Scroll to top on navigation */}
      <ScrollToTop />

      {/* Fixed White Border Frame - Only for public pages */}
      {!isAdminRoute && (
        <div className="hidden sm:block fixed inset-0 z-[40] pointer-events-none border-[22px] border-white"></div>
      )}

      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <StickyCTA />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/join-us" element={<JoinUs />} />
        <Route path="/our-clients" element={<OurClientsPage />} />
        <Route path="/our-partners" element={<OurPartnersPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/services/:slug" element={<DynamicPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/plan/:slug" element={<PlanDetailsPage />} />
        <Route path="/case-studies" element={<MaintenancePage />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:slug" element={<BlogDetail />} />
        <Route path="/amc-plans" element={<AMCPlansPage />} />
        <Route path="/services/amc-plans" element={<AMCPlansPage />} />
        <Route path="/support" element={<Support />} />
        <Route path="/client-portal" element={<ClientPortal />} />
        {/* Catch-all 404 route - prevents soft 404s for unknown URLs */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <AdminProvider>
          <ClientProvider>
            <ContentProvider>
              <AppContent />
            </ContentProvider>
          </ClientProvider>
        </AdminProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;
