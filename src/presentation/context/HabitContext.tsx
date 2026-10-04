import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Habit } from '../../data/models/habit';
import type { HabitCompletion } from '../../data/models/completion';
import type { Task } from '../../data/models/task';
import { StorageRepository } from '../../data/database/db';
import { SAMPLE_HABITS } from '../../core/constants/habits';
import { formatDateToISO } from '../../core/utilities/dateUtils';
import { NotificationService } from '../../domain/services/notificationService';

interface HabitContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  tasks: Task[];
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  currentTime: Date;
  isLoading: boolean;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Habit>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  togglePauseHabit: (id: string) => Promise<void>;
  completeHabit: (habitId: string, customDateStr?: string) => Promise<void>;
  markHabitMissed: (habitId: string, customDateStr?: string) => Promise<void>;
  manualCorrectCompletion: (habitId: string, dateStr: string, status: 'COMPLETED' | 'MISSED' | 'SKIPPED') => Promise<void>;
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => Promise<Task>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  loadSampleData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Timer loop updating time every 10s to keep Dashboard countdowns reactive
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const loadedHabits = await StorageRepository.getAllHabits();
    const loadedCompletions = await StorageRepository.getAllCompletions();
    const loadedTasks = await StorageRepository.getAllTasks();
    setHabits(loadedHabits);
    setCompletions(loadedCompletions);
    setTasks(loadedTasks);
    setIsLoading(false);
  };

  const refreshData = async () => {
    await loadData();
  };

  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Habit> => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await StorageRepository.saveHabit(newHabit);
    setHabits(prev => [...prev, newHabit]);

    // Schedule notification if reminder set
    if (newHabit.reminderMinutes > 0) {
      NotificationService.scheduleHabitReminders(newHabit);
    }

    return newHabit;
  };

  const updateHabit = async (habit: Habit): Promise<void> => {
    const updated = { ...habit, updatedAt: new Date().toISOString() };
    await StorageRepository.saveHabit(updated);
    setHabits(prev => prev.map(h => h.id === habit.id ? updated : h));

    if (updated.reminderMinutes > 0) {
      NotificationService.scheduleHabitReminders(updated);
    }
  };

  const deleteHabit = async (id: string): Promise<void> => {
    await StorageRepository.deleteHabit(id);
    setHabits(prev => prev.filter(h => h.id !== id));
    setCompletions(prev => prev.filter(c => c.habitId !== id));
  };

  const togglePauseHabit = async (id: string): Promise<void> => {
    const target = habits.find(h => h.id === id);
    if (!target) return;

    const updated = { ...target, isPaused: !target.isPaused, updatedAt: new Date().toISOString() };
    await StorageRepository.saveHabit(updated);
    setHabits(prev => prev.map(h => h.id === id ? updated : h));
  };

  const completeHabit = async (habitId: string, customDateStr?: string): Promise<void> => {
    const dateStr = customDateStr || formatDateToISO(currentTime);
    const completion: HabitCompletion = {
      id: `comp-${habitId}-${dateStr}`,
      habitId,
      date: dateStr,
      status: 'COMPLETED',
      completedAt: new Date().toISOString()
    };

    await StorageRepository.saveCompletion(completion);
    setCompletions(prev => {
      const filtered = prev.filter(c => !(c.habitId === habitId && c.date === dateStr));
      return [...filtered, completion];
    });

    // Cancel pending ending notification
    NotificationService.cancelHabitEndingNotification(habitId, dateStr);

    // Trigger celebration confetti animation
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899']
      });
    } catch (e) {
      // Ignore if confetti not supported
    }
  };

  const markHabitMissed = async (habitId: string, customDateStr?: string): Promise<void> => {
    const dateStr = customDateStr || formatDateToISO(currentTime);
    const completion: HabitCompletion = {
      id: `comp-${habitId}-${dateStr}`,
      habitId,
      date: dateStr,
      status: 'MISSED',
      completedAt: null
    };

    await StorageRepository.saveCompletion(completion);
    setCompletions(prev => {
      const filtered = prev.filter(c => !(c.habitId === habitId && c.date === dateStr));
      return [...filtered, completion];
    });
  };

  const manualCorrectCompletion = async (
    habitId: string, 
    dateStr: string, 
    status: 'COMPLETED' | 'MISSED' | 'SKIPPED'
  ): Promise<void> => {
    const completion: HabitCompletion = {
      id: `comp-${habitId}-${dateStr}`,
      habitId,
      date: dateStr,
      status,
      completedAt: status === 'COMPLETED' ? new Date().toISOString() : null
    };

    await StorageRepository.saveCompletion(completion);
    setCompletions(prev => {
      const filtered = prev.filter(c => !(c.habitId === habitId && c.date === dateStr));
      return [...filtered, completion];
    });
  };

  // Task methods
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>): Promise<Task> => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await StorageRepository.saveTask(newTask);
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (task: Task): Promise<void> => {
    const updated = { ...task, updatedAt: new Date().toISOString() };
    await StorageRepository.saveTask(updated);
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
  };

  const deleteTask = async (id: string): Promise<void> => {
    await StorageRepository.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskCompletion = async (id: string): Promise<void> => {
    await StorageRepository.toggleTaskCompletion(id);
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          completed: !t.completed,
          completedAt: !t.completed ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
  };

  const loadSampleData = async (): Promise<void> => {
    for (const sample of SAMPLE_HABITS) {
      await StorageRepository.saveHabit(sample);
    }
    await loadData();
  };

  return (
    <HabitContext.Provider value={{
      habits,
      completions,
      tasks,
      selectedDate,
      setSelectedDate,
      currentTime,
      isLoading,
      addHabit,
      updateHabit,
      deleteHabit,
      togglePauseHabit,
      completeHabit,
      markHabitMissed,
      manualCorrectCompletion,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompletion,
      loadSampleData,
      refreshData
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error('useHabits must be used within a HabitProvider');
  return context;
};
