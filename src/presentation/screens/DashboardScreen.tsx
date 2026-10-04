import React from 'react';
import { useHabits } from '../context/HabitContext';
import { useSettings } from '../context/SettingsContext';
import { determineHabitStatus } from '../../domain/services/timeEngine';
import { calculateHabitStreak } from '../../domain/services/streakEngine';
import { StreakGraph } from '../components/StreakGraph';
import { HabitCard } from '../components/HabitCard';
import { ActiveHabitHeroCard } from '../components/ActiveHabitHeroCard';
import { Habit } from '../../data/models/habit';
import { Plus, CheckCircle2, Clock, Flame, Trophy } from 'lucide-react';
import { formatDateToISO, formatHeaderDate, formatTimeToAMPM } from '../../core/utilities/dateUtils';

interface DashboardScreenProps {
  onOpenCreateModal: () => void;
  onSelectHabit: (habit: Habit) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onOpenCreateModal,
  onSelectHabit
}) => {
  const { habits, completions, currentTime, completeHabit } = useHabits();
  const { settings } = useSettings();
  const todayStr = formatDateToISO(currentTime);

  const hours = currentTime.getHours();
  let timeGreeting = 'Good Morning';
  let emoji = '☀️';
  if (hours >= 12 && hours < 17) {
    timeGreeting = 'Good Afternoon';
    emoji = '👋';
  } else if (hours >= 17) {
    timeGreeting = 'Good Evening';
    emoji = '👋';
  }

  const userName = settings.userName?.trim();
  const fullGreeting = userName ? `${timeGreeting}, ${userName} ${emoji}` : `${timeGreeting} ${emoji}`;

  // Evaluate status and streaks for all habits
  const habitStatuses = habits.map((h) => {
    const comp = completions.find(c => c.habitId === h.id && c.date === todayStr);
    const statusDetails = determineHabitStatus(h, comp, currentTime);
    const streakStats = calculateHabitStreak(h, completions, currentTime);
    return {
      habit: h,
      statusDetails,
      streakStats
    };
  });

  // Filter scheduled habits for today
  const scheduledHabits = habitStatuses.filter(item => item.statusDetails.status !== 'NOT_SCHEDULED');
  const completedCount = scheduledHabits.filter(item => item.statusDetails.status === 'COMPLETED').length;
  const totalScheduled = scheduledHabits.length;
  const completionPercentage = totalScheduled > 0 ? Math.round((completedCount / totalScheduled) * 100) : 0;

  // Find overall max current streak and best streak across active habits
  const maxCurrentStreak = Math.max(...habitStatuses.map(s => s.streakStats.currentStreak), 0);
  const maxLongestStreak = Math.max(...habitStatuses.map(s => s.streakStats.longestStreak), 0);

  // Group habits by status
  const activeItem = scheduledHabits.find(item => item.statusDetails.status === 'ACTIVE');
  const upcomingHabits = scheduledHabits.filter(item => item.statusDetails.status === 'UPCOMING');
  const missedHabits = scheduledHabits.filter(item => item.statusDetails.status === 'MISSED');
  const completedHabits = scheduledHabits.filter(item => item.statusDetails.status === 'COMPLETED');

  // Next upcoming item
  const nextUpcomingItem = upcomingHabits.length > 0 ? upcomingHabits[0] : null;

  return (
    <div className="space-y-6 pb-24">
      {/* Greeting & Date Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {fullGreeting}
        </h2>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
          {formatHeaderDate(currentTime)}
        </p>
      </div>

      {/* Today's Progress Card */}
      <div className="p-5 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-100">
            Today's Progress
          </span>
          <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full">
            {completedCount} / {totalScheduled} Completed
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black">{completionPercentage}%</span>
          <span className="text-xs font-medium text-indigo-200">daily goal completed</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-indigo-900/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Streaks Banner */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl shrink-0">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Streak</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">🔥 {maxCurrentStreak} Days</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xl shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Best Streak</span>
            <span className="text-lg font-black text-slate-900 dark:text-white">🏆 {maxLongestStreak} Days</span>
          </div>
        </div>
      </div>

      {/* LeetCode-style Multi-Year Contribution Graph */}
      <StreakGraph habits={habits} completions={completions} asOfDate={currentTime} />

      {/* Next Upcoming Habit Banner */}
      {!activeItem && nextUpcomingItem && (
        <div className="p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold">
              {nextUpcomingItem.habit.icon}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider block">
                Up Next
              </span>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                {nextUpcomingItem.habit.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {formatTimeToAMPM(nextUpcomingItem.habit.startTime)} – {formatTimeToAMPM(nextUpcomingItem.habit.endTime)} ({nextUpcomingItem.statusDetails.label})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {habits.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#202124] rounded-3xl border border-slate-200 dark:border-[#2F2F33] space-y-4 my-4">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-3xl">
            🌱
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">No habits created yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Mark your day. Build your streak. Create your first habit with target time windows!
            </p>
          </div>
          <button
            onClick={onOpenCreateModal}
            className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 active-touch inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Your First Habit</span>
          </button>
        </div>
      ) : (
        <>
          {/* Active Habit Banner */}
          {activeItem && (
            <section className="space-y-2">
              <h3 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider px-1">
                Active Right Now
              </h3>
              <ActiveHabitHeroCard
                habit={activeItem.habit}
                statusDetails={activeItem.statusDetails}
                onComplete={completeHabit}
                onSelect={onSelectHabit}
              />
            </section>
          )}

          {/* Today's Scheduled Habits List */}
          <section className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              Today's Habits ({scheduledHabits.length})
            </h3>

            {/* Upcoming */}
            {upcomingHabits.length > 0 && (
              <div className="space-y-2.5">
                {upcomingHabits.map(({ habit, statusDetails, streakStats }) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    statusDetails={statusDetails}
                    streakCount={streakStats.currentStreak}
                    onComplete={completeHabit}
                    onSelect={onSelectHabit}
                  />
                ))}
              </div>
            )}

            {/* Missed Today */}
            {missedHabits.length > 0 && (
              <div className="space-y-2.5 opacity-80">
                {missedHabits.map(({ habit, statusDetails, streakStats }) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    statusDetails={statusDetails}
                    streakCount={streakStats.currentStreak}
                    onComplete={completeHabit}
                    onSelect={onSelectHabit}
                  />
                ))}
              </div>
            )}

            {/* Completed Today */}
            {completedHabits.length > 0 && (
              <div className="space-y-2.5">
                {completedHabits.map(({ habit, statusDetails, streakStats }) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    statusDetails={statusDetails}
                    streakCount={streakStats.currentStreak}
                    onComplete={completeHabit}
                    onSelect={onSelectHabit}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Floating Action Button for Add Habit */}
      <button
        onClick={onOpenCreateModal}
        className="fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 hover:scale-105 active-touch transition-all"
        aria-label="Create Habit"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>
    </div>
  );
};
