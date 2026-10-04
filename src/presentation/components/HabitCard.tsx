import React from 'react';
import { Habit, HabitStatusDetails } from '../../data/models/habit';
import { formatTimeToAMPM } from '../../core/utilities/dateUtils';
import { Check, Flame, Clock, X, AlertCircle } from 'lucide-react';

interface HabitCardProps {
  habit: Habit;
  statusDetails: HabitStatusDetails;
  streakCount: number;
  onComplete: (habitId: string) => void;
  onSelect: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  statusDetails,
  streakCount,
  onComplete,
  onSelect
}) => {
  const { status, canComplete, label } = statusDetails;

  const getStatusBadge = () => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            ACTIVE
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold">
            <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 stroke-[3]" />
            COMPLETED
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 text-[11px] font-semibold">
            <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            UPCOMING
          </span>
        );
      case 'MISSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[11px] font-bold">
            <X className="w-3 h-3 text-rose-600 dark:text-rose-400 stroke-[3]" />
            MISSED
          </span>
        );
      case 'NOT_SCHEDULED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#27272A] text-slate-500 dark:text-slate-400 text-[11px] font-medium">
            OFF SCHEDULE
          </span>
        );
    }
  };

  return (
    <div 
      onClick={() => onSelect(habit)}
      className={`p-4 rounded-3xl border transition-all duration-200 cursor-pointer bg-white dark:bg-[#202124] shadow-sm hover:shadow-md active-touch ${
        status === 'ACTIVE' 
          ? 'border-emerald-500/60 ring-1 ring-emerald-500/20 dark:border-emerald-500/50' 
          : 'border-slate-200 dark:border-[#2F2F33]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm"
            style={{ backgroundColor: `${habit.color}18`, color: habit.color }}
          >
            {habit.icon}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                {habit.name}
              </h4>
              {streakCount > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {streakCount}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {formatTimeToAMPM(habit.startTime)} – {formatTimeToAMPM(habit.endTime)}
            </p>
          </div>
        </div>

        <div>
          {getStatusBadge()}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#2F2F33] flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          {label}
        </span>

        {canComplete ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(habit.id);
            }}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active-touch transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>✓ COMPLETE</span>
          </button>
        ) : status === 'ACTIVE' ? (
          <button
            disabled
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-[#27272A] text-slate-400 dark:text-slate-500 font-bold text-xs cursor-not-allowed opacity-80 flex items-center gap-1.5"
            title="Complete button unlocks 5 minutes before end time"
          >
            <span>Complete</span>
          </button>
        ) : status === 'COMPLETED' ? (
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 stroke-[3]" /> Completed
          </span>
        ) : status === 'UPCOMING' ? (
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Not available yet
          </span>
        ) : status === 'MISSED' ? (
          <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
            Expired
          </span>
        ) : null}
      </div>
    </div>
  );
};
