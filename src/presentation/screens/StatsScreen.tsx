import React from 'react';
import { useHabits } from '../context/HabitContext';
import { calculateTargetPeriodStats, calculateOverallStats } from '../../domain/services/statsEngine';
import { calculateHabitStreak } from '../../domain/services/streakEngine';
import { determineHabitStatus } from '../../domain/services/timeEngine';
import { formatDateToISO, isScheduledDay, isDateWithinTargetRange } from '../../core/utilities/dateUtils';
import { Flame, Trophy, BarChart2, PieChart, TrendingUp } from 'lucide-react';
import { subDays, format } from 'date-fns';

export const StatsScreen: React.FC = () => {
  const { habits, completions, currentTime } = useHabits();
  const todayStr = formatDateToISO(currentTime);

  const habitStatsList = habits.map(habit => {
    const periodStats = calculateTargetPeriodStats(habit, completions, currentTime);
    const streakStats = calculateHabitStreak(habit, completions, currentTime);
    const comp = completions.find(c => c.habitId === habit.id && c.date === todayStr);
    const statusDetails = determineHabitStatus(habit, comp, currentTime);
    return {
      habit,
      periodStats,
      streakStats,
      statusDetails
    };
  });

  // Calculate Today's completion rate correctly
  const scheduledToday = habitStatsList.filter(item => item.statusDetails.status !== 'NOT_SCHEDULED');
  const completedToday = scheduledToday.filter(item => item.statusDetails.status === 'COMPLETED').length;
  const todayRate = scheduledToday.length > 0 ? Math.round((completedToday / scheduledToday.length) * 100) : 100;

  const weeklyStats = calculateOverallStats(habits, completions, currentTime, 7);
  const monthlyStats = calculateOverallStats(habits, completions, currentTime, 30);
  const overallStats = calculateOverallStats(habits, completions, currentTime, 365);

  const maxLongestStreak = Math.max(...habitStatsList.map(item => item.streakStats.longestStreak), 0);

  // Generate 7-day completion trend bar data with exact formulas
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const day = subDays(currentTime, 6 - i);
    const dayStr = formatDateToISO(day);

    let scheduledCount = 0;
    let completedCount = 0;

    habits.forEach(h => {
      const isScheduled = isDateWithinTargetRange(dayStr, h.startDate, h.endDate) &&
        isScheduledDay(day, h.repeatType, h.selectedDays) &&
        !h.isPaused;

      if (isScheduled) {
        scheduledCount++;
        const comp = completions.find(c => c.habitId === h.id && c.date === dayStr);
        if (comp?.status === 'COMPLETED') {
          completedCount++;
        }
      }
    });

    const rate = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : null;

    return {
      dayName: format(day, 'EEE'),
      dateStr: dayStr,
      completed: completedCount,
      scheduled: scheduledCount,
      rate
    };
  });

  // Donut Ring Graph SVG component
  const RingGraph: React.FC<{ percentage: number; label: string; sublabel: string; color: string }> = ({
    percentage,
    label,
    sublabel,
    color
  }) => {
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="p-4 rounded-3xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] shadow-sm flex flex-col items-center text-center space-y-2">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-20 h-20 transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              className="text-slate-100 dark:text-[#27272A]"
              fill="transparent"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={color}
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700"
            />
          </svg>
          <span className="absolute font-black text-sm text-slate-900 dark:text-white">
            {percentage}%
          </span>
        </div>
        <div>
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{label}</h4>
          <p className="text-[10px] text-slate-400 font-medium">{sublabel}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 space-y-1">
          <div className="flex items-center justify-between text-indigo-200">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overall Rate</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-3xl font-black">{overallStats.completionRate}%</div>
          <p className="text-[11px] text-indigo-100 font-medium">{overallStats.totalCompleted} total completions</p>
        </div>

        <div className="p-4 rounded-3xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 space-y-1">
          <div className="flex items-center justify-between text-amber-100">
            <span className="text-[11px] font-bold uppercase tracking-wider">Best Streak</span>
            <Flame className="w-4 h-4 fill-white" />
          </div>
          <div className="text-3xl font-black">{maxLongestStreak} Days</div>
          <p className="text-[11px] text-amber-100 font-medium">All-time record</p>
        </div>
      </div>

      {/* Donut Ring Graphs Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          Completion Rate Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          <RingGraph
            percentage={todayRate}
            label="Today"
            sublabel={`${completedToday}/${scheduledToday.length} habits`}
            color="#4F46E5"
          />
          <RingGraph
            percentage={weeklyStats.completionRate}
            label="7 Days"
            sublabel={`${weeklyStats.totalCompleted} completed`}
            color="#10B981"
          />
          <RingGraph
            percentage={monthlyStats.completionRate}
            label="30 Days"
            sublabel={`${monthlyStats.totalCompleted} completed`}
            color="#F59E0B"
          />
        </div>
      </div>

      {/* 7-Day Completion Trend Bar Chart */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Weekly Consistency
          </h3>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Last 7 Days</span>
        </div>

        <div className="flex items-end justify-between gap-2 h-36 pt-4 px-2">
          {last7Days.map((item) => (
            <div key={item.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] font-extrabold text-slate-500">
                {item.rate !== null ? `${item.rate}%` : '-'}
              </span>
              <div className="w-full bg-slate-100 dark:bg-[#27272A] rounded-t-xl overflow-hidden h-full max-h-24 flex items-end">
                {item.rate !== null ? (
                  <div 
                    className="w-full bg-indigo-600 dark:bg-indigo-500 rounded-t-xl transition-all duration-500"
                    style={{ height: `${item.rate}%` }}
                  />
                ) : (
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-700" title="No scheduled habits" />
                )}
              </div>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{item.dayName}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Habit Performance Ranking Bar List */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Habit Performance Ranking
        </h3>

        {habitStatsList.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No habits created yet.</p>
        ) : (
          <div className="space-y-3">
            {habitStatsList
              .sort((a, b) => b.periodStats.completionRate - a.periodStats.completionRate)
              .map(({ habit, periodStats }) => (
                <div key={habit.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <span>{habit.icon}</span>
                      <span>{habit.name}</span>
                    </span>
                    <span className="text-slate-600 dark:text-slate-300 font-extrabold">
                      {periodStats.completionRate}%
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 dark:bg-[#27272A] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${periodStats.completionRate}%`,
                        backgroundColor: habit.color || '#4f46e5'
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
