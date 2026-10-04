import React from 'react';
import { formatHeaderDate } from '../../core/utilities/dateUtils';
import { Logo } from './Logo';
import { Moon, Sun } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  isHomePage?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, isHomePage = false }) => {
  const { settings, setTheme } = useSettings();
  const now = new Date();

  const isDarkMode = settings.theme === 'dark' || 
    (settings.theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <header className="px-5 pt-6 pb-4 bg-white/90 dark:bg-[#0F0F10]/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200/80 dark:border-[#2F2F33]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={34} showText={true} />
        </div>

        {/* ONE Global Theme Control exclusively on Home Page header */}
        {isHomePage && (
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-[#202124] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#27272A] transition-all border border-slate-200/60 dark:border-[#2F2F33] active-touch flex items-center gap-1.5 text-xs font-bold"
            aria-label="Toggle dark mode theme"
            title={isDarkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
          >
            {isDarkMode ? (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-[11px]">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-[11px]">Light</span>
              </>
            )}
          </button>
        )}
      </div>
    </header>
  );
};
