import type { Habit } from '../../data/models/habit';
import type { HabitCompletion } from '../../data/models/completion';
import { 
  formatDateToISO, 
  isScheduledDay, 
  isDateWithinTargetRange 
} from '../../core/utilities/dateUtils';
import { subDays, parseISO, isAfter, isBefore, isEqual } from 'date-fns';

export interface HabitStreakStats {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  totalMissed: number;
  completionRate: number; // 0..100
  targetProgress?: {
    current: number;
    target: number;
    percentage: number;
  };
}

/**
 * Calculates current streak, best streak, completed count, missed count, and completion rate for a habit
 */
export function calculateHabitStreak(
  habit: Habit,
  completions: HabitCompletion[],
  asOfDate: Date = new Date()
): HabitStreakStats {
  const completionMap = new Map<string, 'COMPLETED' | 'MISSED' | 'SKIPPED'>();
  completions.forEach(c => {
    if (c.habitId === habit.id) {
      completionMap.set(c.date, c.status);
    }
  });

  const startDate = parseISO(habit.startDate);
  const currentDate = asOfDate;
  
  // 1. Calculate Current Streak (working backwards from today or yesterday)
  let currentStreak = 0;
  let checkDate = currentDate;

  for (let i = 0; i < 365; i++) {
    const dateStr = formatDateToISO(checkDate);

    // If checkDate is before habit start date, stop loop
    if (isBefore(checkDate, startDate) && !isEqual(checkDate, startDate)) {
      break;
    }

    // Check if target range applies
    if (!isDateWithinTargetRange(dateStr, habit.startDate, habit.endDate)) {
      checkDate = subDays(checkDate, 1);
      continue;
    }

    // Check if scheduled
    const scheduled = isScheduledDay(checkDate, habit.repeatType, habit.selectedDays);
    if (!scheduled) {
      // Unscheduled days DO NOT break streak!
      checkDate = subDays(checkDate, 1);
      continue;
    }

    const status = completionMap.get(dateStr);

    if (status === 'COMPLETED') {
      currentStreak++;
    } else if (status === 'MISSED') {
      // Missed scheduled day resets current streak
      if (i === 0 && dateStr === formatDateToISO(currentDate)) {
        // Today is missed/pending, check yesterday
      } else {
        break;
      }
    } else {
      // No completion record recorded yet
      if (dateStr === formatDateToISO(currentDate)) {
        // Today has not ended yet, do not break streak
      } else {
        // Only break if we're not paused
        if (!habit.isPaused) {
          break;
        }
      }
    }

    checkDate = subDays(checkDate, 1);
  }

  // 2. Calculate Longest Streak & Totals
  let totalCompleted = 0;
  let totalMissed = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  // Count explicit completion records for this habit
  completions.forEach(c => {
    if (c.habitId === habit.id) {
      if (c.status === 'COMPLETED') totalCompleted++;
      else if (c.status === 'MISSED') totalMissed++;
    }
  });

  // Calculate longest streak chronologically
  let scanDate = startDate;
  while (!isAfter(scanDate, currentDate)) {
    const dateStr = formatDateToISO(scanDate);
    
    if (isDateWithinTargetRange(dateStr, habit.startDate, habit.endDate) &&
        isScheduledDay(scanDate, habit.repeatType, habit.selectedDays)) {
      
      const status = completionMap.get(dateStr);
      if (status === 'COMPLETED') {
        runningStreak++;
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      } else if (status === 'MISSED') {
        runningStreak = 0;
      }
    }

    scanDate = subDays(scanDate, -1); // move forward 1 day
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  const totalEvaluated = totalCompleted + totalMissed;
  const completionRate = totalEvaluated > 0 
    ? Math.round((totalCompleted / totalEvaluated) * 100) 
    : 100;

  // 3. Target progress calculation
  let targetProgress;
  if (habit.targetType === 'days' && typeof habit.targetValue === 'number') {
    const target = habit.targetValue;
    const percentage = Math.min(100, Math.round((totalCompleted / target) * 100));
    targetProgress = {
      current: totalCompleted,
      target,
      percentage
    };
  }

  return {
    currentStreak,
    longestStreak,
    totalCompleted,
    totalMissed,
    completionRate,
    targetProgress
  };
}
