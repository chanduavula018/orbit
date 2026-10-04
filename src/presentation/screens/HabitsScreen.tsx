import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { Habit } from '../../data/models/habit';
import { determineHabitStatus } from '../../domain/services/timeEngine';
import { calculateHabitStreak } from '../../domain/services/streakEngine';
import { HabitCard } from '../components/HabitCard';
import { HABIT_CATEGORIES } from '../../core/constants/habits';
import { Search, Plus, SlidersHorizontal } from 'lucide-react';

interface HabitsScreenProps {
  onOpenCreateModal: () => void;
  onSelectHabit: (habit: Habit) => void;
}

export const HabitsScreen: React.FC<HabitsScreenProps> = ({
  onOpenCreateModal,
  onSelectHabit
}) => {
  const { habits, completions, currentTime, completeHabit } = useHabits();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredHabits = habits.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedCategory === 'All') return matchesSearch;
    if (selectedCategory === 'Paused') return matchesSearch && h.isPaused;
    return matchesSearch && h.category === selectedCategory;
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search habits..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            selectedCategory === 'All'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
          }`}
        >
          All ({habits.length})
        </button>

        <button
          onClick={() => setSelectedCategory('Paused')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            selectedCategory === 'Paused'
              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
          }`}
        >
          Paused ({habits.filter(h => h.isPaused).length})
        </button>

        {HABIT_CATEGORIES.map(cat => {
          const count = habits.filter(h => h.category === cat.name).length;
          if (count === 0 && selectedCategory !== cat.name) return null;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                selectedCategory === cat.name
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Habit List */}
      {filteredHabits.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 my-4">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            No habits match your filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHabits.map(habit => {
            const statusDetails = determineHabitStatus(habit, completions.find(c => c.habitId === habit.id), currentTime);
            const streakStats = calculateHabitStreak(habit, completions, currentTime);

            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                statusDetails={statusDetails}
                streakCount={streakStats.currentStreak}
                onComplete={completeHabit}
                onSelect={onSelectHabit}
              />
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={onOpenCreateModal}
        className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 hover:scale-105 active-touch transition-all"
        aria-label="Create Habit"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>
    </div>
  );
};
