export type AppTheme = 'system' | 'light' | 'dark';

export interface UserSettings {
  theme: AppTheme;
  userName?: string;
  startOfWeek: number; // 0 = Sunday, 1 = Monday
  notificationsEnabled: boolean;
  defaultReminderMinutes: number; // 0, 5, 10, 15, 30
  allowManualCorrections: boolean;
  hasCompletedOnboarding: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  userName: '',
  startOfWeek: 1, // Default Monday
  notificationsEnabled: true,
  defaultReminderMinutes: 5,
  allowManualCorrections: false,
  hasCompletedOnboarding: false,
};
