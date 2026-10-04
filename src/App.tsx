import React, { useState, useEffect, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { SettingsProvider, useSettings } from './presentation/context/SettingsContext';
import { HabitProvider, useHabits } from './presentation/context/HabitContext';
import { Header } from './presentation/components/Header';
import { BottomNav } from './presentation/navigation/BottomNav';
import type { NavTab } from './presentation/navigation/BottomNav';
import { DashboardScreen } from './presentation/screens/DashboardScreen';
import { TasksScreen } from './presentation/screens/TasksScreen';
import { NotesScreen } from './presentation/screens/NotesScreen';
import { StatsScreen } from './presentation/screens/StatsScreen';
import { SettingsScreen } from './presentation/screens/SettingsScreen';
import { HabitFormModal } from './presentation/components/HabitFormModal';
import { HabitDetailModal } from './presentation/components/HabitDetailModal';
import { OnboardingModal } from './presentation/components/OnboardingModal';
import type { Habit } from './data/models/habit';
import { determineHabitStatus } from './domain/services/timeEngine';
import { formatDateToISO } from './core/utilities/dateUtils';

const MainAppContent: React.FC = () => {
  const { habits, completions, currentTime, addHabit, updateHabit, deleteHabit, togglePauseHabit, loadSampleData } = useHabits();
  const { settings, updateSettings, isLoading: settingsLoading } = useSettings();
  
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showExitToast, setShowExitToast] = useState(false);

  const lastBackPressRef = useRef<number>(0);

  // Show onboarding modal on first launch if user name is not set or onboarding not completed
  useEffect(() => {
    if (!settingsLoading && !settings.hasCompletedOnboarding && !settings.userName) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [settings.hasCompletedOnboarding, settings.userName, settingsLoading]);

  // Handle Android Hardware Back Button
  useEffect(() => {
    let backListener: any;

    const setupBackButton = async () => {
      try {
        backListener = await CapApp.addListener('backButton', () => {
          // Priority 1: Dismiss open modals
          if (isFormModalOpen) {
            setIsFormModalOpen(false);
            setEditingHabit(null);
            return;
          }
          if (selectedHabit) {
            setSelectedHabit(null);
            return;
          }

          // Priority 2: Return to Home tab if on another screen
          if (activeTab !== 'home') {
            setActiveTab('home');
            return;
          }

          // Priority 3: Double back press to exit app when on Home tab
          const now = Date.now();
          if (now - lastBackPressRef.current < 2000) {
            CapApp.exitApp();
          } else {
            lastBackPressRef.current = now;
            setShowExitToast(true);
            setTimeout(() => setShowExitToast(false), 2000);
          }
        });
      } catch (e) {
        console.warn('Capacitor App backButton listener registration error:', e);
      }
    };

    setupBackButton();

    return () => {
      if (backListener && typeof backListener.remove === 'function') {
        backListener.remove();
      }
    };
  }, [isFormModalOpen, selectedHabit, activeTab]);

  const handleSaveHabit = async (habitData: any) => {
    if (editingHabit) {
      await updateHabit(habitData);
    } else {
      await addHabit(habitData);
    }
    setEditingHabit(null);
  };

  const handleOpenEdit = (habit: Habit) => {
    setSelectedHabit(null);
    setEditingHabit(habit);
    setIsFormModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingHabit(null);
    setIsFormModalOpen(true);
  };

  // Calculate active habits count for bottom nav badge
  const todayStr = formatDateToISO(currentTime);
  const activeCount = habits.filter(h => {
    const comp = completions.find(c => c.habitId === h.id && c.date === todayStr);
    const statusDetails = determineHabitStatus(h, comp, currentTime);
    return statusDetails.status === 'ACTIVE';
  }).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0F0F10] text-slate-900 dark:text-[#F5F5F5] flex flex-col items-center">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 dark:bg-[#0F0F10] flex flex-col shadow-2xl relative">
        
        {/* Sticky App Header */}
        <Header isHomePage={activeTab === 'home'} />

        {/* Screen Content Viewport */}
        <main className="flex-1 px-4 pt-4 overflow-y-auto">
          {activeTab === 'home' && (
            <DashboardScreen
              onOpenCreateModal={handleOpenCreate}
              onSelectHabit={setSelectedHabit}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksScreen />
          )}

          {activeTab === 'notes' && (
            <NotesScreen />
          )}

          {activeTab === 'stats' && (
            <StatsScreen />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCount={activeCount}
        />

        {/* Habit Form Modal (Create / Edit) */}
        <HabitFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingHabit(null);
          }}
          onSave={handleSaveHabit}
          editingHabit={editingHabit}
        />

        {/* Habit Details Modal */}
        <HabitDetailModal
          habit={selectedHabit}
          completions={completions}
          onClose={() => setSelectedHabit(null)}
          onEdit={handleOpenEdit}
          onTogglePause={togglePauseHabit}
          onDelete={deleteHabit}
        />

        {/* Onboarding Welcome Modal */}
        <OnboardingModal
          isOpen={showOnboarding}
          onSaveName={async (name: string) => {
            await updateSettings({ userName: name, hasCompletedOnboarding: true });
            setShowOnboarding(false);
          }}
          onLoadSamples={async () => {
            await loadSampleData();
          }}
        />

        {/* Exit Toast Notification Pill */}
        {showExitToast && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md animate-in fade-in border border-slate-700/60 pointer-events-none">
            Press back again to exit
          </div>
        )}
      </div>
    </div>
  );
};

export function App() {
  return (
    <SettingsProvider>
      <HabitProvider>
        <MainAppContent />
      </HabitProvider>
    </SettingsProvider>
  );
}

export default App;
