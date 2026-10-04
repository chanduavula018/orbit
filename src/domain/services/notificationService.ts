import { LocalNotifications } from '@capacitor/local-notifications';
import { Habit } from '../../data/models/habit';
import { formatTimeToAMPM, formatDateToISO, isScheduledDay, isDateWithinTargetRange } from '../../core/utilities/dateUtils';
import { parseISO } from 'date-fns';

export class NotificationService {
  /**
   * Request notification permission from browser or native OS
   */
  static async requestPermission(): Promise<boolean> {
    try {
      if ('Notification' in window) {
        const result = await Notification.requestPermission();
        if (result === 'granted') return true;
      }
      
      const capResult = await LocalNotifications.requestPermissions();
      return capResult.display === 'granted';
    } catch (e) {
      console.warn('Notification permission request error:', e);
      return false;
    }
  }

  /**
   * Generates a stable integer ID for Capacitor notifications
   */
  static generateNotificationId(habitId: string, dateStr: string): number {
    const raw = `${habitId}_${dateStr}_ending_5m`;
    return Math.abs(raw.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0));
  }

  /**
   * Schedules habit ending window notification (at endTime - 5 minutes)
   */
  static async scheduleHabitEndingNotification(
    habit: Habit, 
    date: Date = new Date(), 
    isAlreadyCompleted: boolean = false
  ): Promise<void> {
    if (!habit.isActive || habit.isPaused || !habit.endTime || isAlreadyCompleted) {
      return;
    }

    const dateStr = formatDateToISO(date);

    // Verify scheduled day & target range
    const isScheduled = isDateWithinTargetRange(dateStr, habit.startDate, habit.endDate) &&
      isScheduledDay(date, habit.repeatType, habit.selectedDays);

    if (!isScheduled) return;

    try {
      const now = new Date();
      const [endH, endM] = habit.endTime.split(':').map(Number);
      
      // Calculate habit end time
      const endDateTime = new Date(date);
      endDateTime.setHours(endH, endM, 0, 0);

      // Notification time is strictly (endTime - 5 minutes)
      const notificationTime = new Date(endDateTime.getTime() - 5 * 60 * 1000);

      const notifId = this.generateNotificationId(habit.id, dateStr);

      if (notificationTime > now) {
        const title = `${habit.icon ? habit.icon + ' ' : ''}${habit.name} ends in 5 minutes`;
        const body = `Habit ends in 5 minutes. You can complete it now.`;

        // Web Notification fallback timer
        const timeoutMs = notificationTime.getTime() - now.getTime();
        setTimeout(() => {
          this.showLocalNotification(title, body);
        }, Math.min(timeoutMs, 2147483647));

        // Capacitor Native Schedule
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: notifId,
              schedule: { at: notificationTime },
              sound: undefined,
              attachments: undefined,
              actionTypeId: '',
              extra: null,
            }
          ]
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Could not schedule ending notification:', e);
    }
  }

  /**
   * Cancel pending ending notification if habit is completed early
   */
  static async cancelHabitEndingNotification(habitId: string, dateStr: string = formatDateToISO(new Date())): Promise<void> {
    try {
      const notifId = this.generateNotificationId(habitId, dateStr);
      await LocalNotifications.cancel({ notifications: [{ id: notifId }] }).catch(() => {});
    } catch (e) {
      console.warn('Could not cancel notification:', e);
    }
  }

  /**
   * Schedule local reminders for a habit (triggers ending notification based on endTime - 5 mins)
   */
  static async scheduleHabitReminders(habit: Habit, date: Date = new Date(), isAlreadyCompleted: boolean = false): Promise<void> {
    await this.scheduleHabitEndingNotification(habit, date, isAlreadyCompleted);
  }

  /**
   * Immediate offline local notification trigger
   */
  static showLocalNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔥</text></svg>'
        });
      } catch (e) {
        console.warn('Web notification error', e);
      }
    }
  }
}
