import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useHabits } from '../context/HabitContext';
import { ExportImportService } from '../../domain/services/exportImportService';
import { NotificationService } from '../../domain/services/notificationService';
import { Logo } from '../components/Logo';
import { 
  Bell, Calendar, Download, Upload, Trash2, 
  ShieldCheck, Check, AlertTriangle, RefreshCw, User, SunMoon
} from 'lucide-react';
import { AppTheme } from '../../data/models/settings';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, setTheme } = useSettings();
  const { refreshData } = useHabits();

  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [userNameInput, setUserNameInput] = useState(settings.userName || '');

  const handleExport = async () => {
    await ExportImportService.exportData();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const jsonString = event.target?.result as string;
      const res = await ExportImportService.importData(jsonString);
      if (res.success) {
        setImportStatus({ type: 'success', message: res.message });
        await refreshData();
      } else {
        setImportStatus({ type: 'error', message: res.message });
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    const { StorageRepository } = await import('../../data/database/db');
    await StorageRepository.clearAllData();
    await refreshData();
    setShowClearConfirm(false);
    setImportStatus({ type: 'success', message: 'All DayMark data cleared successfully.' });
  };

  const handleEnableNotifications = async (enabled: boolean) => {
    if (enabled) {
      const granted = await NotificationService.requestPermission();
      await updateSettings({ notificationsEnabled: granted });
    } else {
      await updateSettings({ notificationsEnabled: false });
    }
  };

  const handleNameBlur = async () => {
    await updateSettings({ userName: userNameInput.trim() });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings & Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Personalization, theme, notifications, data
        </p>
      </div>

      {/* Preferences Section */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Profile & Appearance
        </h3>

        {/* User Name */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-[#2F2F33]">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Your Name</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Greeting on Home dashboard</span>
            </div>
          </div>
          <input
            type="text"
            placeholder="Enter name"
            value={userNameInput}
            onChange={(e) => setUserNameInput(e.target.value)}
            onBlur={handleNameBlur}
            className="w-36 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#27272A] text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-[#2F2F33] focus:outline-none focus:ring-1 focus:ring-indigo-500 text-right"
          />
        </div>

        {/* Global Theme Control */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-[#2F2F33]">
          <div className="flex items-center gap-3">
            <SunMoon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">App Theme</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Global light or dark styling</span>
            </div>
          </div>
          <select
            value={settings.theme}
            onChange={(e) => setTheme(e.target.value as AppTheme)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#27272A] text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-[#2F2F33]"
          >
            <option value="light">☀ Light</option>
            <option value="dark">🌙 Dark</option>
            <option value="system">💻 System</option>
          </select>
        </div>

        {/* Start of Week */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-[#2F2F33]">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Start of Week</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">First day on calendar grids</span>
            </div>
          </div>
          <select
            value={settings.startOfWeek}
            onChange={(e) => updateSettings({ startOfWeek: Number(e.target.value) })}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#27272A] text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-[#2F2F33]"
          >
            <option value={1}>Monday</option>
            <option value={0}>Sunday</option>
          </select>
        </div>

        {/* Allow Manual Corrections */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Allow Manual Corrections</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Correct past completions</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.allowManualCorrections}
            onChange={(e) => updateSettings({ allowManualCorrections: e.target.checked })}
            className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Notifications Section */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Notifications & Alerts
        </h3>

        {/* Enable Notifications */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-[#2F2F33]">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">Habit & Task Reminders</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Local notifications before habits start</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.notificationsEnabled}
            onChange={(e) => handleEnableNotifications(e.target.checked)}
            className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
          />
        </div>

        {/* Default Reminder Lead Time */}
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white block">Default Reminder Lead Time</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">How early notifications trigger</span>
          </div>
          <select
            value={settings.defaultReminderMinutes}
            onChange={(e) => updateSettings({ defaultReminderMinutes: Number(e.target.value) })}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#27272A] text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-[#2F2F33]"
          >
            <option value={0}>At start time</option>
            <option value={5}>5 mins before</option>
            <option value={10}>10 mins before</option>
            <option value={15}>15 mins before</option>
            <option value={30}>30 mins before</option>
          </select>
        </div>
      </div>

      {/* Data Backup & Portability */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Data Backup & Portability
        </h3>

        {importStatus && (
          <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            importStatus.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            {importStatus.type === 'success' ? <Check className="w-4 h-4 stroke-[3]" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="space-y-2.5">
          {/* Export JSON */}
          <button
            onClick={handleExport}
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#27272A] border border-slate-200 dark:border-[#2F2F33] flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-[#333336] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Export Orbit Backup (JSON)
            </span>
            <span className="text-slate-400 font-medium">Download</span>
          </button>

          {/* Import JSON */}
          <label className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-[#27272A] border border-slate-200 dark:border-[#2F2F33] flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-[#333336] transition-colors cursor-pointer">
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Import Backup (JSON)
            </span>
            <span className="text-slate-400 font-medium">Select File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Clear All Data */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </span>
            <span className="text-rose-500 font-medium">Reset</span>
          </button>
        </div>
      </div>

      {/* Privacy Notice Card */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-0.5">
          <span className="font-bold block">100% Offline & Private</span>
          <p className="text-emerald-700 dark:text-emerald-300 leading-relaxed">
            Orbit stores all habits, completions, tasks, notes, and sketches exclusively on your device.
          </p>
        </div>
      </div>

      {/* About Info */}
      <div className="text-center text-xs text-slate-400 py-4 space-y-2">
        <div className="flex items-center justify-center">
          <Logo size={28} showText={true} />
        </div>
        <p className="font-bold text-slate-500 dark:text-slate-400">
          Version 1.0
        </p>
        <p className="text-[11px] text-slate-400">
          Feel your rhythm. Master your progress.
        </p>
      </div>

      {/* Clear Data Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 border border-slate-200 dark:border-[#2F2F33] text-center space-y-4 max-w-xs shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">Clear All Data?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will permanently delete all habits, streak history, tasks, and notes stored on this device.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
