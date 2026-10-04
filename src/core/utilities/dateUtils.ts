import { format, parse, isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import { RepeatType } from '../../data/models/habit';

/**
 * Returns YYYY-MM-DD string for a Date object or current time
 */
export function formatDateToISO(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Returns HH:mm (24-hour) string for a Date object
 */
export function formatTime24(date: Date = new Date()): string {
  return format(date, 'HH:mm');
}

/**
 * Converts "18:30" (24h) to "6:30 PM" (12h)
 */
export function formatTimeToAMPM(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;
  
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return format(date, 'h:mm a');
}

/**
 * Returns day of week: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
 */
export function getDayOfWeek(date: Date = new Date()): number {
  return date.getDay();
}

/**
 * Parses "HH:mm" into minutes since midnight (0..1439)
 */
export function parseTimeToMinutes(time24: string): number {
  if (!time24 || !time24.includes(':')) return 0;
  const [h, m] = time24.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Checks if a given date (YYYY-MM-DD) falls on a scheduled day according to the habit repeat rules
 */
export function isScheduledDay(
  date: Date,
  repeatType: RepeatType,
  selectedDays: number[]
): boolean {
  const day = date.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  
  switch (repeatType) {
    case 'daily':
      return true;
    case 'weekdays':
      return day >= 1 && day <= 5;
    case 'weekends':
      return day === 0 || day === 6;
    case 'custom':
      return Array.isArray(selectedDays) && selectedDays.includes(day);
    default:
      return true;
  }
}

/**
 * Checks if target date is between startDate and target/endDate
 */
export function isDateWithinTargetRange(
  targetDateStr: string,
  startDateStr: string,
  endDateStr?: string | null
): boolean {
  const target = parseISO(targetDateStr);
  const start = parseISO(startDateStr);
  
  if (isBefore(target, start) && !isEqual(target, start)) {
    return false;
  }
  
  if (endDateStr) {
    const end = parseISO(endDateStr);
    if (isAfter(target, end) && !isEqual(target, end)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Format date for user header (e.g. "Wednesday, 30 September")
 */
export function formatHeaderDate(date: Date = new Date()): string {
  return format(date, 'EEEE, d MMMM');
}

/**
 * Format date for short view (e.g. "Sep 30")
 */
export function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d');
  } catch (e) {
    return dateStr;
  }
}
