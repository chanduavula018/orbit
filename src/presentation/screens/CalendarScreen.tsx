import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { useSettings } from '../context/SettingsContext';
import { Habit } from '../../data/models/habit';
import { formatDateToISO, isScheduledDay, isDateWithinTargetRange } from '../../core/utilities/dateUtils';
import { determineHabitStatus } from '../../domain/services/timeEngine';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  parseISO,
  isFuture
} from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Calendar as CalendarIcon, Edit2 } from 'lucide-react';

interface CalendarScreenProps {
  onSelectHabit: (habit: Habit) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ onSelectHabit }) => {
  const { habits, completions, manualCorrectCompletion } = useHabits();
  const { settings } = useSettings();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: settings.startOfWeek === 1 ? 1 : 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: settings.startOfWeek === 1 ? 1 : 0 });

  const daysGrid = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDateStr = formatDateToISO(selectedDate);

  // Calculate day completion summary for calendar grid dots
  const getDaySummary = (day: Date) => {
    const dayStr = formatDateToISO(day);
    const dayHabits = habits.filter(h => 
      isDateWithinTargetRange(dayStr, h.startDate, h.endDate) &&
      isScheduledDay(day, h.repeatType, h.selectedDays) &&
      !h.isPaused
    );

    if (dayHabits.length === 0) return { type: 'none' };

    let completed = 0;
    let missed = 0;

    dayHabits.forEach(h => {
      const comp = completions.find(c => c.habitId === h.id && c.date === dayStr);
      if (comp?.status === 'COMPLETED') completed++;
      else if (comp?.status === 'MISSED' || (!isSameDay(day, new Date()) && !isFuture(day) && !comp)) missed++;
    });

    if (completed === dayHabits.length && completed > 0) return { type: 'all_completed' };
    if (completed > 0) return { type: 'partial' };
    if (missed > 0) return { type: 'missed' };
    return { type: 'upcoming' };
  };

  // Get list of habits scheduled for the selected date
  const selectedDayHabits = habits.filter(h =>
    isDateWithinTargetRange(selectedDateStr, h.startDate, h.endDate) &&
    isScheduledDay(selectedDate, h.repeatType, h.selectedDays)
  );

  return (
    <div className="space-y-6 pb-24">
      
      {/* Month Navigation */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>{format(currentMonth, 'MMMM yyyy')}</span>
          </h2>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Days Header (Mo Tu We Th Fr Sa Su) */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {(settings.startOfWeek === 1 
            ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] 
            : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
          ).map(d => (
            <span key={d} className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {daysGrid.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonthDay = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            const summary = getDaySummary(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`h-11 rounded-2xl flex flex-col items-center justify-center relative transition-all active-touch ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-600/30'
                    : isToday
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold border border-indigo-300 dark:border-indigo-800'
                    : isCurrentMonthDay
                    ? 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              >
                <span className="text-xs">{format(day, 'd')}</span>

                {/* Visual completion indicator dot */}
                {isCurrentMonthDay && summary.type !== 'none' && (
                  <span className="flex items-center justify-center mt-0.5">
                    {summary.type === 'all_completed' ? (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                    ) : summary.type === 'partial' ? (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-200' : 'bg-amber-500'}`} />
                    ) : summary.type === 'missed' ? (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-200' : 'bg-rose-500'}`} />
                    ) : null}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Habits Scheduled for Selected Date */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Habits for {format(selectedDate, 'EEEE, d MMMM')}
          </h3>
          {settings.allowManualCorrections && (
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 dark:border-amber-800/60">
              <Edit2 className="w-3 h-3" /> Corrections Enabled
            </span>
          )}
        </div>

        {selectedDayHabits.length === 0 ? (
          <div className="p-6 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs font-semibold">
            No habits scheduled for this date.
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedDayHabits.map((habit) => {
              const comp = completions.find(c => c.habitId === habit.id && c.date === selectedDateStr);
              const statusDetails = determineHabitStatus(habit, comp, selectedDate);

              return (
                <div 
                  key={habit.id}
                  onClick={() => onSelectHabit(habit)}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
                      style={{ backgroundColor: `${habit.color}18`, color: habit.color }}
                    >
                      {habit.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {habit.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {habit.startTime} – {habit.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {comp?.status === 'COMPLETED' ? (
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> Completed
                      </span>
                    ) : comp?.status === 'MISSED' ? (
                      <span className="text-xs font-extrabold text-rose-500 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800/60">
                        <XCircle className="w-4 h-4" /> Missed
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        Pending
                      </span>
                    )}

                    {/* Manual Corrections Option if enabled in settings */}
                    {settings.allowManualCorrections && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextStatus = comp?.status === 'COMPLETED' ? 'MISSED' : 'COMPLETED';
                          manualCorrectCompletion(habit.id, selectedDateStr, nextStatus);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-indigo-600 hover:text-white transition-colors"
                        title="Toggle status correction"
                      >
                        Correct
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
