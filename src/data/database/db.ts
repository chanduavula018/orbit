import Dexie, { Table } from 'dexie';
import { Habit } from '../models/habit';
import { HabitCompletion } from '../models/completion';
import { UserSettings, DEFAULT_SETTINGS } from '../models/settings';
import { Note } from '../models/note';
import { Task } from '../models/task';

class DayMarkDB extends Dexie {
  habits!: Table<Habit, string>;
  completions!: Table<HabitCompletion, string>;
  settings!: Table<{ key: string; value: any }, string>;
  notes!: Table<Note, string>;
  tasks!: Table<Task, string>;

  constructor() {
    super('DayMarkDatabase');
    
    // Define database schema versions
    this.version(1).stores({
      habits: 'id, category, isPaused, isActive, createdAt',
      completions: 'id, habitId, date, status, [habitId+date]',
      settings: 'key'
    });

    this.version(2).stores({
      habits: 'id, category, isPaused, isActive, createdAt',
      completions: 'id, habitId, date, status, [habitId+date]',
      settings: 'key',
      notes: 'id, title, createdAt, updatedAt'
    });

    this.version(3).stores({
      habits: 'id, category, isPaused, isActive, createdAt',
      completions: 'id, habitId, date, status, [habitId+date]',
      settings: 'key',
      notes: 'id, title, createdAt, updatedAt',
      tasks: 'id, date, completed, createdAt'
    });
  }
}

export const db = new DayMarkDB();

// Fallback LocalStorage keys
const STORAGE_KEYS = {
  HABITS: 'daymark_habits',
  COMPLETIONS: 'daymark_completions',
  SETTINGS: 'daymark_settings',
  NOTES: 'daymark_notes',
  TASKS: 'daymark_tasks',
};

export class StorageRepository {
  // HABITS CRUD
  static async getAllHabits(): Promise<Habit[]> {
    try {
      return await db.habits.toArray();
    } catch (e) {
      console.warn('Dexie error, falling back to LocalStorage', e);
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      return data ? JSON.parse(data) : [];
    }
  }

  static async getHabitById(id: string): Promise<Habit | undefined> {
    try {
      return await db.habits.get(id);
    } catch (e) {
      const habits = await this.getAllHabits();
      return habits.find(h => h.id === id);
    }
  }

  static async saveHabit(habit: Habit): Promise<void> {
    try {
      await db.habits.put(habit);
    } catch (e) {
      const habits = await this.getAllHabits();
      const index = habits.findIndex(h => h.id === habit.id);
      if (index >= 0) habits[index] = habit;
      else habits.push(habit);
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    }
  }

  static async deleteHabit(id: string): Promise<void> {
    try {
      await db.transaction('rw', db.habits, db.completions, async () => {
        await db.habits.delete(id);
        await db.completions.where('habitId').equals(id).delete();
      });
    } catch (e) {
      const habits = (await this.getAllHabits()).filter(h => h.id !== id);
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
      const completions = (await this.getAllCompletions()).filter(c => c.habitId !== id);
      localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
    }
  }

  // COMPLETIONS CRUD
  static async getAllCompletions(): Promise<HabitCompletion[]> {
    try {
      return await db.completions.toArray();
    } catch (e) {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETIONS);
      return data ? JSON.parse(data) : [];
    }
  }

  static async getCompletionsByHabit(habitId: string): Promise<HabitCompletion[]> {
    try {
      return await db.completions.where('habitId').equals(habitId).toArray();
    } catch (e) {
      const all = await this.getAllCompletions();
      return all.filter(c => c.habitId === habitId);
    }
  }

  static async getCompletionsForDate(date: string): Promise<HabitCompletion[]> {
    try {
      return await db.completions.where('date').equals(date).toArray();
    } catch (e) {
      const all = await this.getAllCompletions();
      return all.filter(c => c.date === date);
    }
  }

  static async saveCompletion(completion: HabitCompletion): Promise<void> {
    try {
      const existing = await db.completions
        .where({ habitId: completion.habitId, date: completion.date })
        .first();

      if (existing) {
        await db.completions.put({ ...completion, id: existing.id });
      } else {
        await db.completions.put(completion);
      }
    } catch (e) {
      const all = await this.getAllCompletions();
      const idx = all.findIndex(c => c.habitId === completion.habitId && c.date === completion.date);
      if (idx >= 0) all[idx] = { ...completion, id: all[idx].id };
      else all.push(completion);
      localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(all));
    }
  }

  static async deleteCompletion(habitId: string, date: string): Promise<void> {
    try {
      await db.completions
        .where({ habitId, date })
        .delete();
    } catch (e) {
      const all = (await this.getAllCompletions()).filter(
        c => !(c.habitId === habitId && c.date === date)
      );
      localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(all));
    }
  }

  // TASKS CRUD
  static async getAllTasks(): Promise<Task[]> {
    try {
      return await db.tasks.toArray();
    } catch (e) {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    }
  }

  static async getTasksForDate(date: string): Promise<Task[]> {
    try {
      return await db.tasks.where('date').equals(date).toArray();
    } catch (e) {
      const all = await this.getAllTasks();
      return all.filter(t => t.date === date);
    }
  }

  static async saveTask(task: Task): Promise<void> {
    try {
      await db.tasks.put(task);
    } catch (e) {
      const tasks = await this.getAllTasks();
      const idx = tasks.findIndex(t => t.id === task.id);
      if (idx >= 0) tasks[idx] = task;
      else tasks.push(task);
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  }

  static async deleteTask(id: string): Promise<void> {
    try {
      await db.tasks.delete(id);
    } catch (e) {
      const tasks = (await this.getAllTasks()).filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    }
  }

  static async toggleTaskCompletion(id: string): Promise<void> {
    const tasks = await this.getAllTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated: Task = {
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    };
    await this.saveTask(updated);
  }

  // NOTES CRUD
  static async getAllNotes(): Promise<Note[]> {
    try {
      const notes = await db.notes.toArray();
      return notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch (e) {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      const notes: Note[] = data ? JSON.parse(data) : [];
      return notes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
  }

  static async saveNote(note: Note): Promise<void> {
    try {
      await db.notes.put(note);
    } catch (e) {
      const notes = await this.getAllNotes();
      const idx = notes.findIndex(n => n.id === note.id);
      if (idx >= 0) notes[idx] = note;
      else notes.push(note);
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
  }

  static async deleteNote(id: string): Promise<void> {
    try {
      await db.notes.delete(id);
    } catch (e) {
      const notes = (await this.getAllNotes()).filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
  }

  // SETTINGS CRUD
  static async getSettings(): Promise<UserSettings> {
    try {
      const record = await db.settings.get('user_settings');
      return record ? record.value : DEFAULT_SETTINGS;
    } catch (e) {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    }
  }

  static async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await db.settings.put({ key: 'user_settings', value: settings });
    } catch (e) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
  }

  // CLEAR & RESET
  static async clearAllData(): Promise<void> {
    try {
      await db.habits.clear();
      await db.completions.clear();
      await db.settings.clear();
      await db.notes.clear();
      await db.tasks.clear();
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
  }
}
