import { useState, useEffect } from 'react';
import { getApiUrl } from '../api/config';
import { safeFetchJson } from '../utils/adminApi';

/**
 * Store settings, theme, sections config, hero config, taxes, and GST reporting.
 */
export default function useAdminConfig({
  adminFetch, fetchAdminData, showToast,
  propSectionsConfig, onUpdateSectionsConfig,
  propSettings, onUpdateSettings,
  settings, setSettings
}) {
  const sf = (url) => safeFetchJson(adminFetch, url);

  // ------ Settings ------
  const [settingsForm, setSettingsForm] = useState({
    announcement_text: '', announcement_code: '',
    support_phone: '', support_email: '', support_whatsapp: '',
    partial_deposit_percent: 30,
    enable_multi_currency: 0,
    shipping_fee: 50,
    free_shipping_threshold: 499,
    enable_free_shipping: 1,
    enable_gst: 1,
    gstin_number: '27AAAAA0000A1Z5',
    store_state: 'Madhya Pradesh',
    default_gst_percent: 5.0,
    legal_business_name: 'ValueLife Essentials Private Limited'
  });

  useEffect(() => {
    if (propSettings && typeof propSettings === 'object') {
      const normalized = {
        shipping_fee: 50,
        free_shipping_threshold: 499,
        enable_free_shipping: 1,
        enable_gst: 1,
        gstin_number: '27AAAAA0000A1Z5',
        store_state: 'Madhya Pradesh',
        default_gst_percent: 5.0,
        legal_business_name: 'ValueLife Essentials Private Limited',
        ...propSettings,
        enable_multi_currency: Number(propSettings.enable_multi_currency) === 1 ? 1 : 0,
        enable_free_shipping: propSettings.enable_free_shipping !== undefined ? (Number(propSettings.enable_free_shipping) === 1 ? 1 : 0) : 1,
        enable_gst: propSettings.enable_gst !== undefined ? (Number(propSettings.enable_gst) === 1 ? 1 : 0) : 1,
        default_gst_percent: (propSettings.default_gst_percent !== undefined && propSettings.default_gst_percent !== null && propSettings.default_gst_percent !== '') ? Number(propSettings.default_gst_percent) : 0
      };
      setSettings(normalized);
      setSettingsForm(normalized);
    }
  }, [propSettings]);

  const updateAndSaveSettingToggle = async (key, newValue) => {
    const updatedForm = {
      ...settingsForm,
      [key]: newValue,
      enable_multi_currency: key === 'enable_multi_currency' ? (Number(newValue) === 1 ? 1 : 0) : Number(settingsForm.enable_multi_currency) === 1 ? 1 : 0
    };
    setSettingsForm(updatedForm);
    setSettings(updatedForm);
    if (typeof onUpdateSettings === 'function') onUpdateSettings(updatedForm);
    try {
      const res = await adminFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedForm)
      });
      if (res.ok) {
        const savedData = await res.json();
        const finalSettings = {
          ...updatedForm,
          ...(savedData && typeof savedData === 'object' ? savedData : {}),
          [key]: newValue,
          enable_multi_currency: key === 'enable_multi_currency' ? (Number(newValue) === 1 ? 1 : 0) : (savedData?.enable_multi_currency !== undefined ? (Number(savedData.enable_multi_currency) === 1 ? 1 : 0) : (Number(updatedForm.enable_multi_currency) === 1 ? 1 : 0))
        };
        setSettingsForm(finalSettings);
        setSettings(finalSettings);
        if (typeof onUpdateSettings === 'function') onUpdateSettings(finalSettings);
        if (showToast) showToast('success', 'Setting Auto-Saved!', `${key.replace(/_/g, ' ')} updated to ${newValue === 1 ? 'ENABLED' : 'DISABLED'}`);
      }
    } catch (err) {
      console.error('Failed to auto-save setting toggle:', err);
    }
  };

  const handleSettingsSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await adminFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        const savedData = await res.json();
        const finalSettings = {
          ...settingsForm,
          ...(savedData && typeof savedData === 'object' ? savedData : {}),
          enable_multi_currency: savedData?.enable_multi_currency !== undefined ? (Number(savedData.enable_multi_currency) === 1 ? 1 : 0) : (Number(settingsForm.enable_multi_currency) === 1 ? 1 : 0)
        };
        setSettings(finalSettings);
        setSettingsForm(finalSettings);
        if (typeof onUpdateSettings === 'function') onUpdateSettings(finalSettings);
        fetchAdminData();
        if (showToast) showToast('success', 'Settings Saved', 'Store settings updated live!');
      }
    } catch (err) {}
  };

  // ------ Theme ------
  const [themeConfig, setThemeConfig] = useState({
    primary_color: '#10b981', secondary_color: '#064e3b',
    accent_color: '#34d399', text_color: '#f1f5f9',
    background_color: '#0f172a', card_color: '#1e293b',
    font_primary: 'Inter', font_heading: 'Outfit',
    border_radius: '12', header_style: 'sticky'
  });

  const handleThemeSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/theme-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeConfig)
      });
      if (res.ok) {
        if (showToast) showToast('success', 'Theme Saved', 'Store theme updated live!');
      }
    } catch (err) {}
  };

  // ------ Sections Config ------
  const [sectionsConfig, setSectionsConfig] = useState({
    show_hero: 1, show_announcement: 1, show_promo_banners: 1, show_categories_slider: 1,
    show_featured_products: 1, show_bestsellers: 1, show_new_arrivals: 1,
    show_trust_badges: 1, show_reviews: 1, show_newsletter: 1,
    show_sale_ticker: 0,
    categories_title: 'Shop by Category',
    bestsellers_title: 'Best Sellers',
    sale_ticker_items: '[]'
  });

  // ------ Hero Config ------
  const [heroConfig, setHeroConfig] = useState({
    hero_enabled: 1,
    active_style: 'SPLIT',
    badge_text: '100% Certified Organic Superfoods',
    title: 'Better Choices Better Life.',
    subtitle: 'Discover natural, healthy and premium products for a smarter, happier everyday life.',
    primary_btn_text: 'Shop Now',
    primary_btn_link: '/products',
    secondary_btn_text: 'Explore Offers',
    secondary_btn_link: '/offers',
    image_url: '',
    bg_image_url: ''
  });

  // Fetch initial hero and sections configuration directly from database
  useEffect(() => {
    let isMounted = true;
    const fetchHeroAndSections = async () => {
      try {
        const [heroData, secData] = await Promise.all([
          sf('/api/hero-config'),
          sf('/api/sections-config')
        ]);
        if (!isMounted) return;
        if (heroData && typeof heroData === 'object') {
          const isHeroOn = heroData.hero_enabled !== undefined && heroData.hero_enabled !== null
            ? (Number(heroData.hero_enabled) === 1 || heroData.hero_enabled === true ? 1 : 0)
            : 1;
          setHeroConfig(prev => ({
            ...prev,
            ...heroData,
            hero_enabled: isHeroOn
          }));
        }
        if (secData && typeof secData === 'object') {
          const isHeroOn = secData.show_hero !== undefined && secData.show_hero !== null
            ? (Number(secData.show_hero) === 1 || secData.show_hero === true ? 1 : 0)
            : 1;
          const normalized = {
            ...secData,
            show_hero: isHeroOn
          };
          setSectionsConfig(prev => ({ ...prev, ...normalized }));
          if (typeof onUpdateSectionsConfig === 'function') {
            onUpdateSectionsConfig(normalized);
          }
        }
      } catch (err) {
        console.warn('Hero and sections config fetch note:', err.message);
      }
    };
    fetchHeroAndSections();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (propSectionsConfig && typeof propSectionsConfig === 'object') {
      setSectionsConfig(prev => ({
        ...prev,
        ...propSectionsConfig,
        show_hero: propSectionsConfig.show_hero !== undefined
          ? (Number(propSectionsConfig.show_hero) === 1 || propSectionsConfig.show_hero === true ? 1 : 0)
          : prev.show_hero
      }));
    }
  }, [propSectionsConfig]);

  const handleSectionsConfigSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/sections-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionsConfig)
      });
      if (res.ok) {
        if (typeof onUpdateSectionsConfig === 'function') onUpdateSectionsConfig(sectionsConfig);
        if (showToast) showToast('success', 'Layout Saved', 'Storefront section layout saved!');
      }
    } catch (err) {}
  };

  const updateAndSaveSectionToggle = async (key, newValue) => {
    const numVal = (newValue === 1 || newValue === true || newValue === '1') ? 1 : 0;
    const updated = { ...sectionsConfig, [key]: numVal };
    if (key === 'show_hero') {
      setHeroConfig(prev => ({ ...prev, hero_enabled: numVal }));
    }
    setSectionsConfig(updated);
    if (typeof onUpdateSectionsConfig === 'function') onUpdateSectionsConfig(updated);
    try {
      await adminFetch('/api/admin/sections-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (key === 'show_hero') {
        await adminFetch('/api/admin/hero-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hero_enabled: numVal })
        });
      }
      if (showToast) {
        showToast('success', 'Section Updated', `${key.replace(/_/g, ' ')} updated to ${numVal === 1 ? 'ON' : 'OFF'}`);
      }
    } catch (err) {
      console.error('Failed to auto-save section toggle:', err);
    }
  };

  const updateAndSaveHeroToggle = async (newValue) => {
    const numVal = (newValue === 1 || newValue === true || newValue === '1') ? 1 : 0;
    const updatedHero = { ...heroConfig, hero_enabled: numVal };
    const updatedSections = { ...sectionsConfig, show_hero: numVal };

    setHeroConfig(updatedHero);
    setSectionsConfig(updatedSections);
    if (typeof onUpdateSectionsConfig === 'function') onUpdateSectionsConfig(updatedSections);

    try {
      const [heroRes, secRes] = await Promise.all([
        adminFetch('/api/admin/hero-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedHero)
        }),
        adminFetch('/api/admin/sections-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSections)
        })
      ]);

      if (heroRes.ok || secRes.ok) {
        if (showToast) {
          showToast(
            'success',
            numVal === 1 ? 'Hero Section Enabled' : 'Hero Section Disabled',
            numVal === 1
              ? 'Hero section is now ON and visible on your live storefront.'
              : 'Hero section is now OFF and hidden from your live storefront.'
          );
        }
      }
    } catch (err) {
      console.error('Failed to auto-save hero toggle:', err);
      if (showToast) showToast('error', 'Hero Toggle Error', err.message);
    }
  };

  const handleHeroSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const isHeroOn = Number(heroConfig.hero_enabled) === 1 || heroConfig.hero_enabled === true ? 1 : 0;
      const heroPayload = { ...heroConfig, hero_enabled: isHeroOn };
      const secPayload = { ...sectionsConfig, show_hero: isHeroOn };

      const res = await adminFetch('/api/admin/hero-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroPayload)
      });
      if (res.ok) {
        await adminFetch('/api/admin/sections-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(secPayload)
        });
        setHeroConfig(heroPayload);
        setSectionsConfig(secPayload);
        if (typeof onUpdateSectionsConfig === 'function') onUpdateSectionsConfig(secPayload);
        fetchAdminData();
        if (showToast) showToast('success', 'Hero Config Saved Live!', 'Hero section configuration & layout updated live!');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Hero Save Error', err.message);
    }
  };

  // ------ Taxes & GST ------
  const [stateTaxRates, setStateTaxRates] = useState([]);
  const [taxOverrides, setTaxOverrides] = useState([]);
  const [taxPage, setTaxPage] = useState(1);
  const taxesPerPage = 10;
  const [newOverrideForm, setNewOverrideForm] = useState({ title: '', collection_id: '', tax_rate: '', state_name: '' });
  const [selectedGstMonth, setSelectedGstMonth] = useState('ALL');
  const [gstSummaryData, setGstSummaryData] = useState(null);

  const fetchGstSummaryData = async (monthKey) => {
    const data = await sf(`/api/admin/gst-report/summary${monthKey && monthKey !== 'ALL' ? `?month=${monthKey}` : ''}`);
    if (data) setGstSummaryData(data);
  };

  const fetchTaxesData = async () => {
    const [rates, overrides] = await Promise.all([
      sf('/api/admin/taxes/states'),
      sf('/api/admin/taxes/overrides')
    ]);
    if (rates) setStateTaxRates(rates);
    if (overrides) setTaxOverrides(overrides);
  };

  useEffect(() => {
    fetchTaxesData();
    fetchGstSummaryData(selectedGstMonth);
  }, [selectedGstMonth]);

  const handleSaveStateTaxRates = async () => {
    try {
      const res = await adminFetch('/api/admin/taxes/states', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates: stateTaxRates })
      });
      if (res.ok) {
        if (showToast) showToast('success', 'Tax Rates Saved', 'Regional tax rates updated.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Save Failed', err.message);
    }
  };

  const handleResetStateTaxRates = async () => {
    try {
      const res = await adminFetch('/api/admin/taxes/states/reset', { method: 'POST' });
      if (res.ok) {
        await fetchTaxesData();
        if (showToast) showToast('info', 'Rates Reset', 'State tax rates reset to defaults.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Reset Failed', err.message);
    }
  };

  const handleCreateTaxOverride = async (e) => {
    e.preventDefault();
    try {
      const res = await adminFetch('/api/admin/taxes/overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOverrideForm)
      });
      if (res.ok) {
        setNewOverrideForm({ title: '', collection_id: '', tax_rate: '', state_name: '' });
        await fetchTaxesData();
        if (showToast) showToast('success', 'Override Created', 'Tax override rule added.');
      } else {
        const errData = await res.json().catch(() => ({}));
        if (showToast) showToast('error', 'Override Failed', errData.error || 'Could not create override.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Override Error', err.message);
    }
  };

  const handleDeleteTaxOverride = async (id) => {
    await adminFetch(`/api/admin/taxes/overrides/${id}`, { method: 'DELETE' });
    await fetchTaxesData();
    if (showToast) showToast('info', 'Override Deleted', 'Tax override rule removed.');
  };

  const handleDownloadGstCSV = (monthKey, type) => {
    const token = localStorage.getItem('admin_session_token');
    window.open(getApiUrl(`/api/admin/gst-report/csv?month=${monthKey || 'ALL'}&type=${type || 'full'}&token=${token}`), '_blank');
  };

  // ------ Sidebar navigation ------
  const [openSubmenus, setOpenSubmenus] = useState({
    catalog: true, inventory: false, sales: false,
    customers: false, marketing: false, content: false,
    payment: false, settings: false
  });

  const toggleSubmenu = (key) => {
    setOpenSubmenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return {
    // Settings
    settingsForm, setSettingsForm,
    updateAndSaveSettingToggle,
    handleSettingsSubmit,
    // Theme
    themeConfig, setThemeConfig,
    handleThemeSubmit,
    // Sections
    sectionsConfig, setSectionsConfig,
    handleSectionsConfigSubmit,
    updateAndSaveSectionToggle,
    // Hero
    heroConfig, setHeroConfig,
    handleHeroSubmit,
    updateAndSaveHeroToggle,
    // Taxes
    stateTaxRates, setStateTaxRates,
    taxOverrides,
    taxPage, setTaxPage,
    taxesPerPage,
    newOverrideForm, setNewOverrideForm,
    selectedGstMonth, setSelectedGstMonth,
    gstSummaryData,
    handleSaveStateTaxRates,
    handleResetStateTaxRates,
    handleCreateTaxOverride,
    handleDeleteTaxOverride,
    handleDownloadGstCSV,
    // Navigation
    openSubmenus,
    toggleSubmenu
  };
}
