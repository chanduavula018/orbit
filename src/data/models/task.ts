export type TaskType = 'CALENDAR' | 'GENERAL';

export interface Task {
  id: string;
  taskType: TaskType;
  title: string;
  description?: string;
  date?: string; // YYYY-MM-DD (For CALENDAR tasks)
  startTime?: string; // HH:mm
  deadline?: string; // HH:mm
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
