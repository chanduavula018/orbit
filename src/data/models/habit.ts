export type RepeatType = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type TargetType = 'days' | 'date' | 'none';

export type HabitCategory = 
  | 'Fitness' 
  | 'Study' 
  | 'Work' 
  | 'Mindfulness' 
  | 'Health' 
  | 'Hydration' 
  | 'Sleep' 
  | 'Personal'
  | string;

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: HabitCategory;
  startTime: string; // "HH:mm" 24-hour format e.g. "06:00"
  endTime: string;   // "HH:mm" 24-hour format e.g. "06:30"
  repeatType: RepeatType;
  selectedDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  targetType: TargetType;
  targetValue?: number | string | null; // e.g. 30 days or "2026-10-30"
  startDate: string; // "YYYY-MM-DD"
  endDate?: string | null; // "YYYY-MM-DD"
  reminderMinutes: number; // 0, 5, 10, 15, 30
  isPaused: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type HabitStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'MISSED' | 'NOT_SCHEDULED';

export interface HabitStatusDetails {
  status: HabitStatus;
  label: string;
  timeRemainingMinutes?: number;
  message?: string;
  canComplete: boolean;
}
