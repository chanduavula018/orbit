import React from 'react';
import { Home, CheckSquare, FileText, BarChart3, Settings } from 'lucide-react';

export type NavTab = 'home' | 'tasks' | 'notes' | 'stats' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, activeCount = 0 }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0F0F10]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#2F2F33] pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as NavTab)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 active-touch ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {tab.id === 'home' && activeCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-7 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
