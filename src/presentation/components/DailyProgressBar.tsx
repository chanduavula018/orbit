import React from 'react';
import { Flame, Sparkles } from 'lucide-react';

interface DailyProgressBarProps {
  completedCount: number;
  totalScheduled: number;
  overallStreak?: number;
}

export const DailyProgressBar: React.FC<DailyProgressBarProps> = ({
  completedCount,
  totalScheduled,
  overallStreak = 0,
}) => {
  const percentage = totalScheduled > 0 
    ? Math.round((completedCount / totalScheduled) * 100) 
    : 0;

  const isAllDone = totalScheduled > 0 && completedCount === totalScheduled;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-5 rounded-3xl shadow-lg shadow-indigo-500/20 relative overflow-hidden">
      {/* Decorative background glow elements */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-100 uppercase">
            Today's Progress
          </span>
          <h3 className="text-2xl font-extrabold flex items-center gap-2 mt-0.5">
            <span>{percentage}%</span>
            {isAllDone && (
              <span className="text-xs bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3 fill-slate-900" /> Complete!
              </span>
            )}
          </h3>
        </div>

        {overallStreak > 0 && (
          <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
            <div className="text-right">
              <span className="text-xs font-bold leading-none block">{overallStreak} Day</span>
              <span className="text-[10px] text-indigo-200 uppercase font-semibold leading-none block">Streak</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3.5 bg-black/20 rounded-full overflow-hidden p-0.5 backdrop-blur-sm relative z-10">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-700 ease-out shadow-inner"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-indigo-100 font-medium mt-2.5 relative z-10">
        <span>{completedCount} of {totalScheduled} habits completed</span>
        {totalScheduled > 0 && (
          <span>{totalScheduled - completedCount} remaining</span>
        )}
      </div>
    </div>
  );
};
