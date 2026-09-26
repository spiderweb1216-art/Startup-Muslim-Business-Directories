import React, { useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { SavedProvider } from '@/context/SavedContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider, useData } from '@/context/DataContext';

import Home from '@/pages/Home';
import Directory from '@/pages/Directory';
import Startups from '@/pages/Startups';
import StartupDetail from '@/pages/StartupDetail';
import Founders from '@/pages/Founders';
import FounderDetail from '@/pages/FounderDetail';
import Investors from '@/pages/Investors';
import InvestorDetail from '@/pages/InvestorDetail';
import Funding from '@/pages/Funding';
import Opportunities from '@/pages/Opportunities';
import OpportunityDetail from '@/pages/OpportunityDetail';
import Pitches from '@/pages/Pitches';
import Jobs from '@/pages/Jobs';
import SubmitStartup from '@/pages/SubmitStartup';
import SubmitPitch from '@/pages/SubmitPitch';
import Search from '@/pages/Search';
import Dashboard from '@/pages/Dashboard';
import InvestorDashboard from '@/pages/InvestorDashboard';
import ManageStartup from '@/pages/ManageStartup';
import Admin from '@/pages/Admin';
import Auth from '@/pages/Auth';
import About from '@/pages/About';
import Contact from '@/pages/Contact';


function DynamicMeta() {
  const { pathname } = useLocation();
  const { data } = useData();
  useEffect(() => {
    const routeMap = {
      '/': 'home',
      '/about-directory': 'about-directory',
      '/contact': 'contact',
    };
    let title = data.settings.siteName;
    let description = data.settings.tagline;
    const page = data.pages.find((p) => p.slug === routeMap[pathname]);
    if (page) {
      title = page.seoTitle || page.title;
      description = page.metaDescription || description;
    } else if (pathname.startsWith('/startups/')) {
      const slug = pathname.split('/')[2];
      const startup = data.startups.find((x) => x.slug === slug);
      if (startup) { title = `${startup.name} — ${data.settings.siteName}`; description = startup.tagline || startup.description; }
    } else if (pathname.startsWith('/opportunities/')) {
      const id = decodeURIComponent(pathname.split('/')[2] || '');
      const opportunity = data.opportunities.find((x) => String(x.id) === id);
      if (opportunity) { title = `${opportunity.title} — ${data.settings.siteName}`; description = opportunity.description || description; }
    } else {
      const label = pathname.split('/').filter(Boolean)[0];
      if (label) title = `${label.replaceAll('-', ' ').replace(/\b\w/g, (m) => m.toUpperCase())} — ${data.settings.siteName}`;
    }
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
    meta.content = description || '';
  }, [pathname, data.pages, data.settings, data.startups, data.opportunities]);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

function Layout({ children, hideChrome = false }) {
  return (
    <div className="App">
      {!hideChrome && <Header />}
      <main>{children}</main>
      {!hideChrome && <Footer />}
    </div>
  );
}

function AppRoutes() {
  const { data } = useData();
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();
  if (data.settings.maintenanceMode && !isAdmin && !['/sign-in','/register'].includes(pathname)) {
    return (
      <Layout>
        <div className="wrap min-h-[65vh] py-24 flex items-center justify-center text-center">
          <div className="max-w-xl">
            <div className="eyebrow">Scheduled maintenance</div>
            <h1 className="font-display text-[44px] mt-3">We’ll be back shortly.</h1>
            <p className="text-slate2 mt-4">The directory is temporarily unavailable while the administrator updates the ecosystem database.</p>
          </div>
        </div>
      </Layout>
    );
  }
  return (
    <>
      <ScrollToTop />
      <DynamicMeta />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/directory" element={<Layout><Directory /></Layout>} />
        <Route path="/startups" element={<Layout><Startups /></Layout>} />
        <Route path="/startups/:slug" element={<Layout><StartupDetail /></Layout>} />
        <Route path="/founders" element={<Layout><Founders /></Layout>} />
        <Route path="/founders/:slug" element={<Layout><FounderDetail /></Layout>} />
        <Route path="/investors" element={<Layout><Investors /></Layout>} />
        <Route path="/investors/:slug" element={<Layout><InvestorDetail /></Layout>} />
        <Route path="/funding" element={<Layout><Funding /></Layout>} />
        <Route path="/opportunities" element={<Layout><Opportunities /></Layout>} />
        <Route path="/opportunities/:id" element={<Layout><OpportunityDetail /></Layout>} />
        <Route path="/pitches" element={<Layout><Pitches /></Layout>} />
        <Route path="/jobs" element={<Layout><Jobs /></Layout>} />
        <Route path="/submit-startup" element={<Layout><ProtectedRoute><SubmitStartup /></ProtectedRoute></Layout>} />
        <Route path="/submit-pitch" element={<Layout><SubmitPitch /></Layout>} />
        <Route path="/search" element={<Layout><Search /></Layout>} />
        <Route path="/dashboard" element={<Layout><ProtectedRoute><Dashboard /></ProtectedRoute></Layout>} />
        <Route path="/dashboard/investor" element={<Layout><ProtectedRoute><InvestorDashboard /></ProtectedRoute></Layout>} />
        <Route path="/dashboard/startups/:slug" element={<Layout><ProtectedRoute><ManageStartup /></ProtectedRoute></Layout>} />
        <Route path="/admin" element={<Layout hideChrome><ProtectedRoute adminOnly><Admin /></ProtectedRoute></Layout>} />
        <Route path="/sign-in" element={<Layout hideChrome><Auth mode="signin" /></Layout>} />
        <Route path="/register" element={<Layout hideChrome><Auth mode="register" /></Layout>} />
        <Route path="/admin/login" element={<Layout hideChrome><Auth mode="signin" admin /></Layout>} />
        <Route path="/about-directory" element={<Layout><About /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="*" element={<Layout><Home /></Layout>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <SavedProvider>
              <AppRoutes />
            </SavedProvider>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
