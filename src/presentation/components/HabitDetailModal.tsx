import React, { useState } from 'react';
import { Habit } from '../../data/models/habit';
import { HabitCompletion } from '../../data/models/completion';
import { calculateHabitStreak } from '../../domain/services/streakEngine';
import { formatTimeToAMPM, formatShortDate, formatDateToISO } from '../../core/utilities/dateUtils';
import { X, Flame, Trophy, CheckCircle, XCircle, Edit3, PauseCircle, PlayCircle, Trash2, Calendar, Target } from 'lucide-react';
import { subDays } from 'date-fns';

interface HabitDetailModalProps {
  habit: Habit | null;
  completions: HabitCompletion[];
  onClose: () => void;
  onEdit: (habit: Habit) => void;
  onTogglePause: (habitId: string) => Promise<void>;
  onDelete: (habitId: string) => Promise<void>;
}

export const HabitDetailModal: React.FC<HabitDetailModalProps> = ({
  habit,
  completions,
  onClose,
  onEdit,
  onTogglePause,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!habit) return null;

  const stats = calculateHabitStreak(habit, completions);

  // Generate 7-day history list
  const recentHistory = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), i);
    const dateStr = formatDateToISO(d);
    const comp = completions.find(c => c.habitId === habit.id && c.date === dateStr);
    return {
      date: d,
      dateStr,
      displayDate: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : formatShortDate(dateStr),
      status: comp?.status || (i === 0 ? 'PENDING' : 'MISSED')
    };
  });

  const handleDelete = async () => {
    await onDelete(habit.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-[#18181B] w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-[#2F2F33] max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header Banner */}
        <div 
          className="p-6 text-white relative overflow-hidden"
          style={{ backgroundColor: habit.color }}
        >
          <div className="flex items-center justify-between relative z-10 mb-4">
            <span className="px-3 py-1 rounded-full bg-black/20 text-xs font-extrabold uppercase tracking-wider">
              {habit.category}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(habit)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                title="Edit Habit"
              >
                <Edit3 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
              {habit.icon}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold leading-tight">{habit.name}</h2>
              <p className="text-xs text-white/80 font-medium mt-0.5">
                {formatTimeToAMPM(habit.startTime)} – {formatTimeToAMPM(habit.endTime)}
              </p>
              {habit.isPaused && (
                <span className="inline-block text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full mt-1">
                  PAUSED
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <Flame className="w-6 h-6 fill-amber-500" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Current Streak</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{stats.currentStreak} Days</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Best Streak</span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{stats.longestStreak} Days</span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              <span>Performance</span>
              <span className="text-indigo-600 dark:text-indigo-400 text-sm font-extrabold">{stats.completionRate}% Rate</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/60 dark:border-[#2F2F33]">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>{stats.totalCompleted} Completed</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                <XCircle className="w-4 h-4 text-rose-500" />
                <span>{stats.totalMissed} Missed</span>
              </div>
            </div>
          </div>

          {/* Target Progress if applicable */}
          {stats.targetProgress && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Target className="w-4 h-4 text-indigo-600" /> Goal Target
                </span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  {stats.targetProgress.current} / {stats.targetProgress.target} days
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-[#27272A] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${stats.targetProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* History List */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Recent History
            </h3>
            <div className="space-y-1.5">
              {recentHistory.map((item) => (
                <div 
                  key={item.dateStr}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#202124] border border-slate-100 dark:border-[#2F2F33] text-xs font-medium"
                >
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.displayDate}</span>
                  <div>
                    {item.status === 'COMPLETED' ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 stroke-[2.5]" /> Completed
                      </span>
                    ) : item.status === 'MISSED' ? (
                      <span className="text-rose-500 font-bold flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Missed
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-[#2F2F33] flex items-center justify-between gap-3">
            <button
              onClick={() => onTogglePause(habit.id)}
              className="flex-1 py-3 px-4 rounded-2xl border border-slate-300 dark:border-[#2F2F33] font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-[#27272A] transition-colors"
            >
              {habit.isPaused ? (
                <>
                  <PlayCircle className="w-4 h-4 text-emerald-500" />
                  <span>Resume Habit</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-4 h-4 text-amber-500" />
                  <span>Pause Habit</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="py-3 px-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 border border-slate-200 dark:border-[#2F2F33] text-center space-y-4 max-w-xs shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">Delete Habit?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Delete "{habit.name}" and all of its historical records? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
