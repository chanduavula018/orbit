import { Habit } from '../../data/models/habit';
import { HabitCompletion } from '../../data/models/completion';
import { isScheduledDay, isDateWithinTargetRange, formatDateToISO } from '../../core/utilities/dateUtils';
import { subDays, isBefore, isAfter, parseISO, isSameDay } from 'date-fns';

export interface CalculatedHabitStats {
  habitId: string;
  habitName: string;
  totalScheduledOpportunities: number;
  totalCompleted: number;
  totalMissed: number;
  completionRate: number; // 0..100
  targetProgress?: {
    current: number;
    target: number;
    percentage: number;
  };
}

export interface OverallPeriodStats {
  completionRate: number;
  totalCompleted: number;
  totalMissed: number;
  totalOpportunities: number;
}

/**
 * Calculates target-period accurate statistics for a single habit
 */
export function calculateTargetPeriodStats(
  habit: Habit,
  completions: HabitCompletion[],
  asOfDate: Date = new Date()
): CalculatedHabitStats {
  const completionMap = new Map<string, 'COMPLETED' | 'MISSED' | 'SKIPPED'>();
  completions.forEach(c => {
    if (c.habitId === habit.id) {
      completionMap.set(c.date, c.status);
    }
  });

  const habitStartDate = parseISO(habit.startDate);
  const todayStr = formatDateToISO(asOfDate);

  let totalScheduledOpportunities = 0;
  let totalCompleted = 0;
  let totalMissed = 0;

  // Determine date bounds: from habit.startDate to min(endDate/targetValue, today)
  let endDateLimit = asOfDate;
  if (habit.targetType === 'date' && habit.targetValue) {
    try {
      const parsedEnd = parseISO(String(habit.targetValue));
      if (isBefore(parsedEnd, asOfDate)) {
        endDateLimit = parsedEnd;
      }
    } catch (e) {
      // Keep asOfDate
    }
  } else if (habit.endDate) {
    try {
      const parsedEnd = parseISO(habit.endDate);
      if (isBefore(parsedEnd, asOfDate)) {
        endDateLimit = parsedEnd;
      }
    } catch (e) {
      // Keep asOfDate
    }
  }

  // Iterate chronologically through all dates in valid target window
  let curr = habitStartDate;
  while (!isAfter(curr, endDateLimit)) {
    const currStr = formatDateToISO(curr);

    // Check target date range & pause state & scheduled days
    if (isDateWithinTargetRange(currStr, habit.startDate, habit.endDate) &&
        isScheduledDay(curr, habit.repeatType, habit.selectedDays) &&
        !habit.isPaused) {

      const status = completionMap.get(currStr);

      if (status === 'COMPLETED') {
        totalScheduledOpportunities++;
        totalCompleted++;
      } else if (status === 'MISSED') {
        totalScheduledOpportunities++;
        totalMissed++;
      } else {
        // No completion record stored
        if (isSameDay(curr, asOfDate)) {
          // If current date is today, check if habit end time has passed
          const [hEnd, mEnd] = habit.endTime.split(':').map(Number);
          const nowMins = asOfDate.getHours() * 60 + asOfDate.getMinutes();
          const endMins = (hEnd || 0) * 60 + (mEnd || 0);

          if (nowMins > endMins) {
            // Expired today without completion
            totalScheduledOpportunities++;
            totalMissed++;
          }
          // Otherwise today's active/upcoming habit is NOT counted as missed yet
        } else if (isBefore(curr, asOfDate)) {
          // Past scheduled day expired without completion
          totalScheduledOpportunities++;
          totalMissed++;
        }
      }
    }

    curr = subDays(curr, -1); // move forward 1 day
  }

  const completionRate = totalScheduledOpportunities > 0
    ? Math.round((totalCompleted / totalScheduledOpportunities) * 100)
    : 100;

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
    habitId: habit.id,
    habitName: habit.name,
    totalScheduledOpportunities,
    totalCompleted,
    totalMissed,
    completionRate,
    targetProgress
  };
}

/**
 * Calculates overall statistics across all habits for a specific time range (e.g. 7 days, 30 days, or all time)
 */
export function calculateOverallStats(
  habits: Habit[],
  completions: HabitCompletion[],
  asOfDate: Date = new Date(),
  daysToScan: number = 30
): OverallPeriodStats {
  let totalOpportunities = 0;
  let totalCompleted = 0;
  let totalMissed = 0;

  habits.forEach(habit => {
    const habitStats = calculateTargetPeriodStats(habit, completions, asOfDate);
    totalOpportunities += habitStats.totalScheduledOpportunities;
    totalCompleted += habitStats.totalCompleted;
    totalMissed += habitStats.totalMissed;
  });

  const completionRate = totalOpportunities > 0
    ? Math.round((totalCompleted / totalOpportunities) * 100)
    : 100;

  return {
    completionRate,
    totalCompleted,
    totalMissed,
    totalOpportunities
  };
}
