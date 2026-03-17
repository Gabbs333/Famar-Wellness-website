// Settings Page
// CMS configuration and preferences

import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { 
  Settings as SettingsIcon,
  Globe,
  Bell,
  Shield,
  Palette,
  Database,
  Save,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  timezone: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Farma Wellness',
    siteDescription: 'Professional wellness and health services',
    siteUrl: 'https://farma-wellness.com',
    timezone: 'Africa/Douala',
    language: 'fr',
    emailNotifications: true,
    pushNotifications: false,
    autoSave: true,
    autoSaveInterval: 30,
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Paramètres enregistrés avec succès !');
  };

  const handleChange = (key: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Paramètres
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configurez les préférences de votre CMS et les paramètres du site
        </p>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Palette className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Apparence
          </h3>
        </div>
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Thème
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                theme === 'light' 
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              <Sun className="w-6 h-6 mr-2 text-amber-500" />
              <span className="font-medium">Clair</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                theme === 'dark' 
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
            >
              <Moon className="w-6 h-6 mr-2 text-indigo-500" />
              <span className="font-medium">Sombre</span>
            </button>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Paramètres généraux
          </h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom du site
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description du site
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Site URL
              </label>
              <input
                type="url"
                value={settings.siteUrl}
                onChange={(e) => handleChange('siteUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Africa/Douala">Africa/Douala (UTC+1)</option>
                <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                <option value="America/New_York">America/New_York (UTC-5)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Langue
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
              <option value="es">Espagnol</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Bell className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Notifications
          </h3>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700 dark:text-gray-300">Notifications par email</span>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700 dark:text-gray-300">Notifications push</span>
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => handleChange('pushNotifications', e.target.checked)}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
            />
          </label>
        </div>
      </div>

      {/* Editor Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <SettingsIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Paramètres de l'éditeur
          </h3>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700 dark:text-gray-300">Sauvegarde automatique</span>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => handleChange('autoSave', e.target.checked)}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
            />
          </label>
          
          {settings.autoSave && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Intervalle de sauvegarde automatique (secondes)
              </label>
              <input
                type="number"
                min={10}
                max={300}
                value={settings.autoSaveInterval}
                onChange={(e) => handleChange('autoSaveInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5 mr-2" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
