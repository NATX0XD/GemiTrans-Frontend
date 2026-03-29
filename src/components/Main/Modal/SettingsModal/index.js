import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, Globe, Volume2, Sun, SlidersHorizontal, Check, AlertTriangle } from 'lucide-react';
import { Button, Spinner } from '@heroui/react';
import { auth } from '../../../../configuration/firebase';
import { getUserSettings, saveUserSettings } from '../../../../services/settingsService';
import { clearSpeechSettingsCache } from '../../../../services/speechService';
import { useData } from '../../../../context/DataContext';
import ConfirmModal from '../ConfirmModal';

// Sub-components
import LanguageSettings from './LanguageSettings';
import VoiceSettings from './VoiceSettings';
import AppearanceSettings from './AppearanceSettings';

const SettingsModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('languages');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);
  const [initialSettings, setInitialSettings] = useState(null);

  // Global Context
  const { theme, setTheme } = useData();

  // Core States (Local for Modal)
  const [defaultLanguages, setDefaultLanguages] = useState(['English', 'Japanese']);
  const [voiceSettings, setVoiceSettings] = useState({ speed: 1.0, pitch: 1.0 });
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    if (!isOpen || !auth.currentUser) return;

    const fetchSettings = async () => {
      setLoading(true);
      const settings = await getUserSettings(auth.currentUser.uid);
      
      // Always set initialSettings to enable change detection, even for new users
      const baseSettings = {
        defaultLanguages: settings?.defaultLanguages || ['English', 'Japanese'],
        voiceSettings: settings?.voiceSettings || { speed: 1.0, pitch: 1.0 },
        theme: settings?.theme || theme
      };
      setInitialSettings(baseSettings);

      // Initialize local states with fetched values
      if (settings) {
        if (settings.defaultLanguages) setDefaultLanguages(settings.defaultLanguages);
        if (settings.voiceSettings) setVoiceSettings(settings.voiceSettings);
        if (settings.theme) setLocalTheme(settings.theme);
      } else {
        // Fallback for new users
        setLocalTheme(theme);
      }
      setLoading(false);
    };

    fetchSettings();
  }, [isOpen, auth.currentUser]); // Re-fetch when modal opens or user changes

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      // 1. Save to Database
      await saveUserSettings(auth.currentUser.uid, {
        defaultLanguages,
        voiceSettings,
        theme: localTheme,
      });
      
      // 2. Sync Globally (This applies the theme to the entire app)
      setTheme(localTheme);

      // 3. Update initial settings to current values after successful save
      setInitialSettings({
        defaultLanguages: [...defaultLanguages],
        voiceSettings: { ...voiceSettings },
        theme: localTheme
      });

      clearSpeechSettingsCache();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save settings", error);
    } finally {
      setSaving(false);
    }
  };

  // Change Detection Logic (Compares with initialSettings captured on open/last save)
  const hasChanges = initialSettings && (
    JSON.stringify(defaultLanguages) !== JSON.stringify(initialSettings.defaultLanguages) ||
    JSON.stringify(voiceSettings) !== JSON.stringify(initialSettings.voiceSettings) ||
    localTheme !== initialSettings.theme
  );

  const handleCloseAttempt = () => {
    if (hasChanges && !showSuccess) {
      setShowConfirmDiscard(true);
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !saving) {
      handleCloseAttempt();
    }
  };

  const toggleLanguage = (langLabel) => {
    if (defaultLanguages.includes(langLabel)) {
      setDefaultLanguages(prev => prev.filter(l => l !== langLabel));
    } else {
      if (defaultLanguages.length < 3) {
        setDefaultLanguages(prev => [...prev, langLabel]);
      }
    }
  };

  const removeLanguage = (langLabel) => {
    setDefaultLanguages(prev => prev.filter(l => l !== langLabel));
  };

  const tabs = [
    { id: 'languages', label: 'Languages', icon: <Globe size={18} /> },
    { id: 'voice', label: 'Voice & Audio', icon: <Volume2 size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Sun size={18} /> },
  ];

  const modalContent = (
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md transition-all p-4 ${localTheme === 'dark' ? 'dark' : ''}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white/90 dark:bg-slate-900 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 fade-in duration-300 h-[600px] max-h-[90vh]"
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50/50 dark:bg-slate-950/50 border-b md:border-b-0 md:border-r border-slate-100/50 dark:border-slate-800 flex flex-col pt-8">
          <div className="px-6 pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100/20 dark:border-indigo-500/20">
                <SlidersHorizontal size={16} />
              </div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Settings</h2>
            </div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Personalize your app</p>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all border-none cursor-pointer outline-none text-sm font-bold ${activeTab === tab.id
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100 dark:border-slate-700/50 ring-1 ring-slate-200/50 dark:ring-slate-700/50'
                    : 'bg-transparent text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300 text-slate-400/80 dark:text-slate-500'
                  }`}
              >
                <span className={activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Close Button (Absolute Top Right) */}
        <button
          onClick={handleCloseAttempt}
          disabled={saving}
          className="absolute top-6 right-8 w-10 h-10 rounded-2xl bg-white/50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center justify-center transition-all border border-slate-200/50 dark:border-slate-700 cursor-pointer outline-none active:scale-90 disabled:opacity-50 z-50 shadow-sm"
        >
          <X size={20} />
        </button>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden relative transition-colors duration-500">

          {/* Header (Section Specific) */}
          <div className="px-8 pt-10 pb-4 flex items-center justify-between">
            <div className="max-w-[70%]">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 capitalize tracking-tight">{activeTab === 'voice' ? 'Voice & Audio' : activeTab}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {activeTab === 'languages' && "Quick-access translation menu preferences."}
                {activeTab === 'voice' && "Control how the AI speaks your translations."}
                {activeTab === 'appearance' && "Customize the look and feel of the application."}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar relative">
            {loading && (
              <div className="absolute inset-0 z-50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                <Spinner color="primary" size="lg" />
              </div>
            )}

            {/* Content Switcher */}
            <div className="space-y-6">
              {activeTab === 'languages' && (
                <LanguageSettings
                  defaultLanguages={defaultLanguages}
                  toggleLanguage={toggleLanguage}
                  removeLanguage={removeLanguage}
                />
              )}

              {activeTab === 'voice' && (
                <VoiceSettings 
                   voiceSettings={voiceSettings}
                   setVoiceSettings={setVoiceSettings}
                />
              )}

              {activeTab === 'appearance' && (
                <AppearanceSettings 
                   theme={localTheme}
                   setTheme={setLocalTheme}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-950/30">
            <div>
              {showSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800/50 animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-bold">Successfully Saved</span>
                </div>
              )}
            </div>
            <Button
              color="primary"
              onPress={handleSave}
              isLoading={saving}
              isDisabled={loading}
              startContent={!saving && <Save size={18} />}
              className="h-10 px-8 rounded-2xl font-black shadow-xl shadow-indigo-500/25 dark:shadow-indigo-900/40 active:scale-95 transition-all bg-indigo-600 hover:bg-indigo-500"
            >
              {saving ? 'Syncing...' : 'Apply'}
            </Button>
          </div>
        </div>

      </div>

      <ConfirmModal 
        isOpen={showConfirmDiscard}
        onClose={() => setShowConfirmDiscard(false)}
        onConfirm={onClose}
        title="Discard Changes?"
        message="You have unsaved changes. If you leave now, your adjustments will be lost and the app will not update."
        confirmText="Discard Anyway"
        cancelText="Stay Here"
        variant="warning"
        customIcon={AlertTriangle}
      />
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default SettingsModal;
