import { Habit, HabitStatusDetails } from '../../data/models/habit';
import { HabitCompletion } from '../../data/models/completion';
import { 
  formatTimeToAMPM, 
  parseTimeToMinutes, 
  isScheduledDay, 
  isDateWithinTargetRange,
  formatDateToISO
} from '../../core/utilities/dateUtils';

/**
 * Validates whether startTime is before endTime, or valid cross-midnight
 */
export function validateHabitTimes(startTime: string, endTime: string): { isValid: boolean; error?: string } {
  if (!startTime || !endTime) {
    return { isValid: false, error: 'Start and end times are required' };
  }
  if (startTime === endTime) {
    return { isValid: false, error: 'End time must be different from start time' };
  }
  return { isValid: true };
}

/**
 * Determines exact status of a habit for a given date and time.
 * Note: Habit completion is only unlocked during the final 5 minutes of the habit window (endTime - 5 mins).
 */
export function determineHabitStatus(
  habit: Habit,
  completion: HabitCompletion | undefined,
  targetDate: Date = new Date(),
  currentTimeStr?: string
): HabitStatusDetails {
  const dateStr = formatDateToISO(targetDate);
  const nowStr = currentTimeStr || `${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}`;
  
  // 1. Check if existing completion record exists for this date
  if (completion) {
    if (completion.status === 'COMPLETED') {
      const timeLabel = completion.completedAt 
        ? new Date(completion.completedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : '';
      return {
        status: 'COMPLETED',
        label: timeLabel ? `Completed at ${timeLabel}` : 'Completed',
        canComplete: false,
        message: 'Habit completed!'
      };
    }
    if (completion.status === 'MISSED') {
      return {
        status: 'MISSED',
        label: 'Missed',
        canComplete: false,
        message: 'Time window expired'
      };
    }
    if (completion.status === 'SKIPPED') {
      return {
        status: 'NOT_SCHEDULED',
        label: 'Skipped',
        canComplete: false,
        message: 'Habit skipped'
      };
    }
  }

  // 2. Check if habit is paused
  if (habit.isPaused) {
    return {
      status: 'NOT_SCHEDULED',
      label: 'Paused',
      canComplete: false,
      message: 'Habit is currently paused'
    };
  }

  // 3. Check target date range (startDate to targetValue / endDate)
  if (!isDateWithinTargetRange(dateStr, habit.startDate, habit.endDate)) {
    return {
      status: 'NOT_SCHEDULED',
      label: 'Not Scheduled',
      canComplete: false,
      message: 'Outside target schedule'
    };
  }

  // 4. Check repeat schedule (daily, weekdays, weekends, custom)
  if (!isScheduledDay(targetDate, habit.repeatType, habit.selectedDays)) {
    return {
      status: 'NOT_SCHEDULED',
      label: 'Not Scheduled',
      canComplete: false,
      message: 'Not scheduled for today'
    };
  }

  // 5. Evaluate Time Window (Current time vs Habit Start/End Time)
  const currentMinutes = parseTimeToMinutes(nowStr);
  const startMinutes = parseTimeToMinutes(habit.startTime);
  const endMinutes = parseTimeToMinutes(habit.endTime);

  const isCrossMidnight = startMinutes > endMinutes;

  if (!isCrossMidnight) {
    // Normal Window (e.g., 11:00 - 11:30)
    const completionWindowStart = Math.max(startMinutes, endMinutes - 5);

    if (currentMinutes < startMinutes) {
      const diff = startMinutes - currentMinutes;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      return {
        status: 'UPCOMING',
        label: `Starts in ${timeStr}`,
        timeRemainingMinutes: diff,
        canComplete: false,
        message: `Window starts at ${formatTimeToAMPM(habit.startTime)}`
      };
    } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      const diff = endMinutes - currentMinutes;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

      const isFinal5Mins = currentMinutes >= completionWindowStart;

      return {
        status: 'ACTIVE',
        label: isFinal5Mins ? `Ends in ${timeStr} (Complete Now)` : `Ends in ${timeStr}`,
        timeRemainingMinutes: diff,
        canComplete: isFinal5Mins,
        message: isFinal5Mins
          ? `Active until ${formatTimeToAMPM(habit.endTime)} - Completion Open`
          : `Active until ${formatTimeToAMPM(habit.endTime)} - Unlocks in final 5 mins`
      };
    } else {
      // Past window
      return {
        status: 'MISSED',
        label: 'Missed',
        canComplete: false,
        message: 'Completion window ended'
      };
    }
  } else {
    // Cross Midnight Window (e.g., 23:30 - 00:15)
    const isActive = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    if (isActive) {
      let diff = 0;
      if (currentMinutes >= startMinutes) {
        diff = (1440 - currentMinutes) + endMinutes;
      } else {
        diff = endMinutes - currentMinutes;
      }
      const mins = diff % 60;
      const hours = Math.floor(diff / 60);
      const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

      // Final 5 minutes calculation for cross midnight
      const completionWindowStartMins = endMinutes - 5;
      let isFinal5Mins = false;
      if (completionWindowStartMins >= 0) {
        isFinal5Mins = currentMinutes >= completionWindowStartMins && currentMinutes <= endMinutes;
      } else {
        const windowStartIn1440 = 1440 + completionWindowStartMins;
        isFinal5Mins = (currentMinutes >= windowStartIn1440 && currentMinutes < 1440) || (currentMinutes <= endMinutes);
      }

      return {
        status: 'ACTIVE',
        label: isFinal5Mins ? `Ends in ${timeStr} (Complete Now)` : `Ends in ${timeStr}`,
        timeRemainingMinutes: diff,
        canComplete: isFinal5Mins,
        message: isFinal5Mins
          ? `Active until ${formatTimeToAMPM(habit.endTime)} - Completion Open`
          : `Active until ${formatTimeToAMPM(habit.endTime)} - Unlocks in final 5 mins`
      };
    } else {
      if (currentMinutes > endMinutes && currentMinutes <= 720) {
        return {
          status: 'MISSED',
          label: 'Missed',
          canComplete: false,
          message: 'Completion window ended'
        };
      } else {
        const diff = startMinutes - currentMinutes;
        const mins = diff % 60;
        const hours = Math.floor(diff / 60);
        const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        return {
          status: 'UPCOMING',
          label: `Starts in ${timeStr}`,
          timeRemainingMinutes: diff,
          canComplete: false,
          message: `Window starts at ${formatTimeToAMPM(habit.startTime)}`
        };
      }
    }
  }
}
