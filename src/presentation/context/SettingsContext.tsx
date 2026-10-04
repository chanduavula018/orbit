import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_SETTINGS } from '../../data/models/settings';
import type { UserSettings, AppTheme } from '../../data/models/settings';
import { StorageRepository } from '../../data/database/db';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  setTheme: (theme: AppTheme) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const applyThemeToDOM = (theme: AppTheme) => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System mode
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const loadSettings = async () => {
    setIsLoading(true);
    const loaded = await StorageRepository.getSettings();
    setSettings(loaded);
    applyThemeToDOM(loaded.theme);
    setIsLoading(false);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await StorageRepository.saveSettings(updated);
    if (newSettings.theme) {
      applyThemeToDOM(newSettings.theme);
    }
  };

  const setTheme = async (theme: AppTheme) => {
    await updateSettings({ theme });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, setTheme, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
};
