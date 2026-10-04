import { StorageRepository } from '../../data/database/db';
import { Habit } from '../../data/models/habit';
import { HabitCompletion } from '../../data/models/completion';
import { UserSettings } from '../../data/models/settings';
import { Note } from '../../data/models/note';

export interface DayMarkBackup {
  version: string;
  exportedAt: string;
  habits: Habit[];
  completions: HabitCompletion[];
  settings: UserSettings;
  notes?: Note[];
}

export class ExportImportService {
  /**
   * Generates backup JSON structure and initiates browser file download
   */
  static async exportData(): Promise<void> {
    const habits = await StorageRepository.getAllHabits();
    const completions = await StorageRepository.getAllCompletions();
    const settings = await StorageRepository.getSettings();
    const notes = await StorageRepository.getAllNotes();

    const backupData: DayMarkBackup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      habits,
      completions,
      settings,
      notes
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().split('T')[0];
    const link = document.createElement('a');
    link.href = url;
    link.download = `daymark_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Reads a JSON string and validates/restores habits, completions, settings, and notes
   */
  static async importData(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const data: DayMarkBackup = JSON.parse(jsonString);

      if (!data || !Array.isArray(data.habits) || !Array.isArray(data.completions)) {
        return { success: false, message: 'Invalid backup file format.' };
      }

      // Restore habits
      for (const habit of data.habits) {
        if (habit.id && habit.name) {
          await StorageRepository.saveHabit(habit);
        }
      }

      // Restore completions
      for (const completion of data.completions) {
        if (completion.habitId && completion.date && completion.status) {
          await StorageRepository.saveCompletion(completion);
        }
      }

      // Restore settings if provided
      if (data.settings) {
        await StorageRepository.saveSettings(data.settings);
      }

      // Restore notes if provided
      if (Array.isArray(data.notes)) {
        for (const note of data.notes) {
          if (note.id && note.title) {
            await StorageRepository.saveNote(note);
          }
        }
      }

      return { 
        success: true, 
        message: `Successfully imported data (${data.habits.length} habits, ${data.completions.length} completions)!` 
      };
    } catch (e: any) {
      return { success: false, message: `Failed to import data: ${e.message || 'Corrupted file'}` };
    }
  }
}
