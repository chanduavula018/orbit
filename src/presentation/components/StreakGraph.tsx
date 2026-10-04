import React, { useState } from 'react';
import { Habit } from '../../data/models/habit';
import { HabitCompletion } from '../../data/models/completion';
import { isScheduledDay, isDateWithinTargetRange, formatDateToISO } from '../../core/utilities/dateUtils';
import { calculateHabitStreak } from '../../domain/services/streakEngine';
import { 
  format, 
  parseISO, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth, 
  getYear, 
  subMonths,
  getDay,
  isSameDay,
  isAfter,
  startOfDay,
  subYears
} from 'date-fns';
import { Check, X as XIcon, Info, ChevronDown } from 'lucide-react';

interface StreakGraphProps {
  habits: Habit[];
  completions: HabitCompletion[];
  asOfDate?: Date;
}

export const StreakGraph: React.FC<StreakGraphProps> = ({
  habits,
  completions,
  asOfDate = new Date(),
}) => {
  const currentYear = getYear(asOfDate);
  const [periodOption, setPeriodOption] = useState<'current' | 'past_year'>('current');
  const [selectedDayInfo, setSelectedDayInfo] = useState<{
    dateStr: string;
    completed: number;
    total: number;
    rate: number;
    isFuture: boolean;
    scheduledHabits: { habit: Habit; completed: boolean }[];
  } | null>(null);

  // Generate 12 months for selected period
  const months: Date[] = [];
  const baseMonth = periodOption === 'current' ? asOfDate : endOfMonth(subYears(asOfDate, 1));

  for (let i = 11; i >= 0; i--) {
    months.push(subMonths(baseMonth, i));
  }

  // Calculate day stats map & summary totals
  const dayStatsMap = new Map<string, {
    completed: number;
    total: number;
    rate: number;
    isFuture: boolean;
    scheduledHabits: { habit: Habit; completed: boolean }[];
  }>();

  let totalCompletions = 0;
  let totalActiveDays = 0;
  let activeStreakCount = 0;
  let maxStreak = 0;

  const today = startOfDay(asOfDate);

  // Calculate stats for all days across the 12 months
  months.forEach(mDate => {
    const mStart = startOfMonth(mDate);
    const mEnd = endOfMonth(mDate);
    const daysInMonth = eachDayOfInterval({ start: mStart, end: mEnd });

    daysInMonth.forEach(day => {
      const dateStr = formatDateToISO(day);
      const dayStart = startOfDay(day);
      const isFuture = isAfter(dayStart, today);

      let scheduledCount = 0;
      let completedCount = 0;
      const scheduledList: { habit: Habit; completed: boolean }[] = [];

      if (!isFuture) {
        habits.forEach(h => {
          const isScheduled = isDateWithinTargetRange(dateStr, h.startDate, h.endDate) &&
            isScheduledDay(day, h.repeatType, h.selectedDays) &&
            !h.isPaused;

          if (isScheduled) {
            scheduledCount++;
            const comp = completions.find(c => c.habitId === h.id && c.date === dateStr);
            const isComp = comp?.status === 'COMPLETED';
            if (isComp) {
              completedCount++;
            }
            scheduledList.push({ habit: h, completed: isComp });
          }
        });
      }

      const rate = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;

      dayStatsMap.set(dateStr, {
        completed: completedCount,
        total: scheduledCount,
        rate,
        isFuture,
        scheduledHabits: scheduledList
      });

      if (!isFuture) {
        totalCompletions += completedCount;
        if (completedCount > 0) {
          totalActiveDays++;
          activeStreakCount++;
          if (activeStreakCount > maxStreak) {
            maxStreak = activeStreakCount;
          }
        } else if (scheduledCount > 0) {
          activeStreakCount = 0;
        }
      }
    });
  });

  // Cross-verify max streak with habit engine calculations
  habits.forEach(h => {
    const stats = calculateHabitStreak(h, completions, asOfDate);
    if (stats.longestStreak > maxStreak) {
      maxStreak = stats.longestStreak;
    }
  });

  // Group each month into strict month blocks (padding day 1 to match weekday row)
  const monthBlocks = months.map(mDate => {
    const mStart = startOfMonth(mDate);
    const mEnd = endOfMonth(mDate);
    const daysInMonth = eachDayOfInterval({ start: mStart, end: mEnd });
    
    const firstWeekday = getDay(mStart); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    
    // Create items array padded at start so day 1 lands on correct weekday row
    const items: (Date | null)[] = [];
    for (let p = 0; p < firstWeekday; p++) {
      items.push(null);
    }
    daysInMonth.forEach(d => items.push(d));

    // Pad end so last week column has 7 slots
    while (items.length % 7 !== 0) {
      items.push(null);
    }

    // Split month items into 7-row columns
    const columns: (Date | null)[][] = [];
    for (let c = 0; c < items.length; c += 7) {
      columns.push(items.slice(c, c + 7));
    }

    return {
      monthName: format(mStart, 'MMM'),
      columns
    };
  });

  // Heatmap intensity level determination
  const getIntensityClass = (stats: { completed: number; total: number; rate: number; isFuture: boolean }) => {
    if (stats.isFuture || stats.total === 0) {
      return 'bg-slate-100 dark:bg-[#27272A] border border-slate-200/50 dark:border-[#2F2F33]';
    }
    if (stats.completed === 0) {
      return 'bg-slate-200/80 dark:bg-[#202124] border border-slate-300/60 dark:border-[#2F2F33]';
    }
    if (stats.rate <= 25) {
      return 'bg-emerald-200 dark:bg-emerald-950/80 border border-emerald-300/50';
    }
    if (stats.rate <= 50) {
      return 'bg-emerald-300 dark:bg-emerald-800 border border-emerald-400/50';
    }
    if (stats.rate <= 75) {
      return 'bg-emerald-400 dark:bg-emerald-700 border border-emerald-500/50';
    }
    return 'bg-emerald-500 dark:bg-emerald-500 border border-emerald-400 shadow-sm';
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] shadow-sm space-y-4">
      {/* Header with dynamic total completions and info icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
            <span>{totalCompletions} habit completions in the past {periodOption === 'current' ? 'one year' : 'year'}</span>
            <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer" />
          </div>
        </div>

        {/* Right side stats & Period dropdown */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <div>Total active days: <span className="font-extrabold text-slate-900 dark:text-white">{totalActiveDays}</span></div>
          <div>Max streak: <span className="font-extrabold text-slate-900 dark:text-white">{maxStreak}</span></div>

          {/* Compact Period Dropdown */}
          <div className="relative inline-block">
            <select
              value={periodOption}
              onChange={(e) => {
                setPeriodOption(e.target.value as 'current' | 'past_year');
                setSelectedDayInfo(null);
              }}
              className="appearance-none bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-slate-200 text-xs font-bold py-1 pl-2.5 pr-6 rounded-xl border border-slate-200 dark:border-[#2F2F33] cursor-pointer focus:outline-none"
            >
              <option value="current">Current</option>
              <option value="past_year">Past year ({currentYear - 1})</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container — Horizontal Scroll ONLY inside this div */}
      <div className="overflow-x-auto pb-2 pt-1 no-scrollbar touch-pan-x">
        <div className="min-w-max flex gap-3.5 items-start">
          {monthBlocks.map((block, bIdx) => (
            <div key={bIdx} className="flex flex-col gap-1.5">
              {/* Month Header Label directly above month block */}
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 h-4 block">
                {block.monthName}
              </span>

              {/* Month Columns (contains strictly days of this month) */}
              <div className="flex gap-1">
                {block.columns.map((col, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-1">
                    {col.map((day, rowIdx) => {
                      if (!day) {
                        return <div key={rowIdx} className="w-3 h-3 opacity-0 pointer-events-none" />;
                      }

                      const dateStr = formatDateToISO(day);
                      const stats = dayStatsMap.get(dateStr) || { completed: 0, total: 0, rate: 0, isFuture: false, scheduledHabits: [] };
                      const isSelected = selectedDayInfo?.dateStr === dateStr;
                      const isToday = isSameDay(day, asOfDate);

                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDayInfo({ dateStr, ...stats })}
                          className={`w-3 h-3 rounded-[3px] transition-all active:scale-125 ${getIntensityClass(
                            stats
                          )} ${
                            isSelected 
                              ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 scale-125 z-10' 
                              : isToday 
                              ? 'ring-1 ring-amber-500' 
                              : ''
                          }`}
                          title={`${format(day, 'MMM d, yyyy')}: ${stats.isFuture ? 'Future date' : stats.total === 0 ? 'No scheduled habits' : `${stats.completed}/${stats.total} completed (${stats.rate}%)`}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contribution Intensity Legend */}
      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-1 border-t border-slate-100 dark:border-[#2F2F33]">
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 dark:bg-[#27272A] border border-slate-200/50 dark:border-[#2F2F33]" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 dark:bg-emerald-950/80" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-300 dark:bg-emerald-800" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 dark:bg-emerald-700" />
          <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 dark:bg-emerald-500" />
          <span>More</span>
        </div>
      </div>

      {/* Selected Day Detail Popover / Tooltip Card */}
      {selectedDayInfo && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#18181B] border border-slate-200 dark:border-[#2F2F33] space-y-2 animate-in fade-in text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white block text-sm">
                {format(parseISO(selectedDayInfo.dateStr), 'EEEE, MMMM d, yyyy')}
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {selectedDayInfo.isFuture
                  ? 'Future date'
                  : selectedDayInfo.total === 0 
                  ? 'No scheduled habits' 
                  : `${selectedDayInfo.completed} / ${selectedDayInfo.total} habits completed (${selectedDayInfo.rate}%)`}
              </span>
            </div>
            <button
              onClick={() => setSelectedDayInfo(null)}
              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1"
            >
              Close
            </button>
          </div>

          {/* List of habits for selected date */}
          {!selectedDayInfo.isFuture && selectedDayInfo.scheduledHabits.length > 0 && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-[#2F2F33] space-y-1.5">
              {selectedDayInfo.scheduledHabits.map(({ habit, completed }) => (
                <div key={habit.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <span>{habit.icon}</span>
                    <span>{habit.name}</span>
                  </span>
                  {completed ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Completed
                    </span>
                  ) : (
                    <span className="text-rose-500 font-extrabold flex items-center gap-1">
                      <XIcon className="w-3.5 h-3.5 stroke-[3]" /> Missed
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
