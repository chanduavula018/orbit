import { Habit } from '../../data/models/habit';

export const HABIT_ICONS = [
  '🏋️', '📚', '💧', '🧘', '🏃', '🥗', '😴', '💻', 
  '📖', '🎯', '🚴', '🍏', '🧠', '✍️', '🎨', '🎵',
  '⚡', '💊', '🚶', '🌱', '☀️', '🌙', '🧹', '💰'
];

export const HABIT_CATEGORIES = [
  { name: 'Fitness', icon: '🏋️', color: '#ef4444' },
  { name: 'Study', icon: '📚', color: '#3b82f6' },
  { name: 'Work', icon: '💼', color: '#8b5cf6' },
  { name: 'Mindfulness', icon: '🧘', color: '#10b981' },
  { name: 'Health', icon: '🥗', color: '#84cc16' },
  { name: 'Hydration', icon: '💧', color: '#06b6d4' },
  { name: 'Sleep', icon: '😴', color: '#6366f1' },
  { name: 'Personal', icon: '🎯', color: '#ec4899' }
];

export const HABIT_COLORS = [
  '#4f46e5', // Indigo
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#64748b'  // Slate
];

export const SAMPLE_HABITS: Habit[] = [
  {
    id: 'sample-gym',
    name: 'Gym',
    description: '30 minutes workout routine',
    icon: '🏋️',
    color: '#ef4444',
    category: 'Fitness',
    startTime: '06:00',
    endTime: '06:30',
    repeatType: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    targetType: 'days',
    targetValue: 30,
    startDate: '2026-09-01',
    endDate: '2026-10-01',
    reminderMinutes: 5,
    isPaused: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-study',
    name: 'Study',
    description: 'Focus on coding and reading docs',
    icon: '📚',
    color: '#3b82f6',
    category: 'Study',
    startTime: '08:00',
    endTime: '09:00',
    repeatType: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    targetType: 'none',
    startDate: '2026-09-01',
    reminderMinutes: 10,
    isPaused: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-water',
    name: 'Drink Water',
    description: 'Hydrate with a large glass of water',
    icon: '💧',
    color: '#06b6d4',
    category: 'Hydration',
    startTime: '11:00',
    endTime: '11:10',
    repeatType: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    targetType: 'none',
    startDate: '2026-09-01',
    reminderMinutes: 5,
    isPaused: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-meditation',
    name: 'Meditation',
    description: '15 minutes mindfulness session',
    icon: '🧘',
    color: '#10b981',
    category: 'Mindfulness',
    startTime: '19:00',
    endTime: '19:15',
    repeatType: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    targetType: 'none',
    startDate: '2026-09-01',
    reminderMinutes: 5,
    isPaused: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sample-reading',
    name: 'Reading',
    description: 'Read 20 pages of a book',
    icon: '📖',
    color: '#8b5cf6',
    category: 'Personal',
    startTime: '21:00',
    endTime: '21:30',
    repeatType: 'weekdays',
    selectedDays: [1, 2, 3, 4, 5],
    targetType: 'none',
    startDate: '2026-09-01',
    reminderMinutes: 15,
    isPaused: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
