import React from 'react';
import { Habit, HabitStatusDetails } from '../../data/models/habit';
import { formatTimeToAMPM } from '../../core/utilities/dateUtils';
import { Flame, CheckCircle2, Clock } from 'lucide-react';

interface ActiveHabitHeroCardProps {
  habit: Habit;
  statusDetails: HabitStatusDetails;
  onComplete: (habitId: string) => void;
  onSelect: (habit: Habit) => void;
}

export const ActiveHabitHeroCard: React.FC<ActiveHabitHeroCardProps> = ({
  habit,
  statusDetails,
  onComplete,
  onSelect
}) => {
  return (
    <div 
      className="bg-emerald-600 dark:bg-emerald-700 text-white rounded-3xl p-5 shadow-lg shadow-emerald-600/20 relative overflow-hidden transition-transform duration-200 hover:scale-[1.01]"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-xs font-extrabold uppercase tracking-wider text-emerald-100">
          <Flame className="w-4 h-4 fill-emerald-300 text-emerald-300" />
          ACTIVE NOW
        </span>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 bg-white/10 px-2.5 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5" />
          {statusDetails.label}
        </span>
      </div>

      <div className="cursor-pointer my-3" onClick={() => onSelect(habit)}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl shadow-sm">
            {habit.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold leading-tight">{habit.name}</h3>
            <p className="text-xs text-white/80 mt-0.5 line-clamp-1">
              {habit.description || `${habit.category} Habit`}
            </p>
            <p className="text-xs font-medium text-white/90 mt-1">
              {formatTimeToAMPM(habit.startTime)} – {formatTimeToAMPM(habit.endTime)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
        <span className="text-xs text-white/90 font-medium">
          {statusDetails.canComplete ? 'Habit window open for completion' : 'Unlocks in final 5 mins'}
        </span>

        {statusDetails.canComplete ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(habit.id);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-emerald-700 font-extrabold text-sm shadow-md hover:bg-emerald-50 active-touch transition-all"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>✓ COMPLETE</span>
          </button>
        ) : (
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/30 text-white/90 font-extrabold text-xs opacity-80 cursor-not-allowed"
            title="Completion unlocks 5 minutes before end time"
          >
            <span>Complete</span>
          </button>
        )}
      </div>
    </div>
  );
};
