import React, { useState, useEffect } from 'react';
import AdminDashboard from './components/admin/AdminDashboard';
import ToastNotification from './components/common/ToastNotification';
import BrandLoader from './components/common/BrandLoader';
import { getApiUrl } from './api/config';

export default function App() {
  const [toast, setToast] = useState(null);
  const [sectionsConfig, setSectionsConfig] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
  };

  useEffect(() => {
    const initData = async () => {
      try {
        const [secRes, setRes] = await Promise.all([
          fetch(getApiUrl('/api/sections-config')).catch(() => null),
          fetch(getApiUrl('/api/settings')).catch(() => null)
        ]);
        if (secRes && secRes.ok) {
          const secData = await secRes.json();
          setSectionsConfig(secData);
        }
        if (setRes && setRes.ok) {
          const setData = await setRes.json();
          setSettings(setData);
        }
      } catch (e) {
        console.warn('Admin initial data fetch note:', e.message);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const handleExitAdmin = () => {
    if (window.confirm('Open live storefront in a new tab?')) {
      const storeUrl = import.meta.env.VITE_STOREFRONT_URL || 'https://valuelifeessentials.com';
      window.open(storeUrl, '_blank');
    }
  };

  if (loading) {
    return <BrandLoader text="Initializing ValueLife Admin Portal..." fullScreen={true} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Plus_Jakarta_Sans']">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
      <AdminDashboard
        onExitAdmin={handleExitAdmin}
        showToast={showToast}
        sectionsConfig={sectionsConfig}
        onUpdateSectionsConfig={setSectionsConfig}
        settings={settings}
        onUpdateSettings={setSettings}
      />
    </div>
  );
}
