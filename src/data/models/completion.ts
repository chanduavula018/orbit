export type CompletionStatus = 'COMPLETED' | 'MISSED' | 'SKIPPED';

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // "YYYY-MM-DD"
  status: CompletionStatus;
  completedAt?: string | null; // ISO DateTime string
  notes?: string;
}
