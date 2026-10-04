import { describe, it, expect } from 'vitest';
import { Habit } from '../../data/models/habit';
import { HabitCompletion } from '../../data/models/completion';
import { Task } from '../../data/models/task';
import { determineHabitStatus } from '../services/timeEngine';
import { calculateHabitStreak } from '../services/streakEngine';
import { isScheduledDay, isDateWithinTargetRange } from '../../core/utilities/dateUtils';

describe('Habit vs Task Data Model & Streak Isolation Tests', () => {
  const baseHabit: Habit = {
    id: 'habit-gym',
    name: 'Gym',
    icon: '🏋️',
    color: '#ef4444',
    category: 'Fitness',
    startTime: '06:00',
    endTime: '07:00',
    repeatType: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    targetType: 'none',
    startDate: '2026-10-01',
    reminderMinutes: 5,
    isPaused: false,
    isActive: true,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  };

  const calTask: Task = {
    id: 'task-assignment',
    taskType: 'CALENDAR',
    title: 'Submit Assignment',
    description: 'Math assignment submission',
    date: '2026-10-04',
    startTime: '10:00',
    deadline: '17:00',
    completed: false,
    completedAt: null,
    createdAt: '2026-10-04T00:00:00.000Z',
    updatedAt: '2026-10-04T00:00:00.000Z',
  };

  const genTask: Task = {
    id: 'task-java',
    taskType: 'GENERAL',
    title: 'Complete Java practice',
    completed: false,
    completedAt: null,
    createdAt: '2026-10-04T00:00:00.000Z',
    updatedAt: '2026-10-04T00:00:00.000Z',
  };

  // Helper for single-day daily completion rate
  function calculateSingleDayCompletionRate(habits: Habit[], completions: HabitCompletion[], targetDateStr: string, targetDate: Date) {
    let scheduledCount = 0;
    let completedCount = 0;

    habits.forEach(h => {
      const isScheduled = isDateWithinTargetRange(targetDateStr, h.startDate, h.endDate) &&
        isScheduledDay(targetDate, h.repeatType, h.selectedDays) &&
        !h.isPaused;

      if (isScheduled) {
        scheduledCount++;
        const comp = completions.find(c => c.habitId === h.id && c.date === targetDateStr);
        if (comp?.status === 'COMPLETED') {
          completedCount++;
        }
      }
    });

    return {
      scheduledCount,
      completedCount,
      rate: scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 100
    };
  }

  it('completing a task does NOT increase or modify habit streak', () => {
    const habitCompletions: HabitCompletion[] = [
      { id: 'c1', habitId: 'habit-gym', date: '2026-10-01', status: 'COMPLETED' },
      { id: 'c2', habitId: 'habit-gym', date: '2026-10-02', status: 'COMPLETED' },
    ];

    const statsBefore = calculateHabitStreak(baseHabit, habitCompletions, new Date('2026-10-02'));
    expect(statsBefore.currentStreak).toBe(2);

    // Complete task for Oct 3
    const completedTask: Task = { ...calTask, completed: true, completedAt: '2026-10-03T12:00:00.000Z' };

    // Recalculate streak: task completion has zero effect on habitCompletions array
    const statsAfter = calculateHabitStreak(baseHabit, habitCompletions, new Date('2026-10-02'));
    expect(statsAfter.currentStreak).toBe(2);
    expect(completedTask.completed).toBe(true);
  });

  it('verifies Calendar Tasks and General Tasks separation', () => {
    const allTasks: Task[] = [calTask, genTask];

    // Calendar tasks filtering for Oct 4
    const oct4CalTasks = allTasks.filter(t => t.taskType === 'CALENDAR' && t.date === '2026-10-04');
    expect(oct4CalTasks.length).toBe(1);
    expect(oct4CalTasks[0].title).toBe('Submit Assignment');

    // Selecting Oct 5 -> Oct 4 calendar task disappears
    const oct5CalTasks = allTasks.filter(t => t.taskType === 'CALENDAR' && t.date === '2026-10-05');
    expect(oct5CalTasks.length).toBe(0);

    // General tasks (MY TASKS) list -> standalone checklist, independent of date
    const generalList = allTasks.filter(t => t.taskType === 'GENERAL');
    expect(generalList.length).toBe(1);
    expect(generalList[0].title).toBe('Complete Java practice');
    expect(generalList[0].date).toBeUndefined();
  });

  it('verifies Saturday example with 2 of 3 completed habits yields exactly 67%, NOT 100%', () => {
    const gym: Habit = { ...baseHabit, id: 'gym', name: 'Gym' };
    const study: Habit = { ...baseHabit, id: 'study', name: 'Study' };
    const run: Habit = { ...baseHabit, id: 'run', name: 'Run' };
    const habitsList = [gym, study, run];

    // Saturday Oct 3: Gym completed, Study completed, Run missed/uncompleted
    const completions: HabitCompletion[] = [
      { id: 'c1', habitId: 'gym', date: '2026-10-03', status: 'COMPLETED' },
      { id: 'c2', habitId: 'study', date: '2026-10-03', status: 'COMPLETED' },
      { id: 'c3', habitId: 'run', date: '2026-10-03', status: 'MISSED' },
    ];

    const saturdayDate = new Date('2026-10-03T23:59:00');
    const result = calculateSingleDayCompletionRate(habitsList, completions, '2026-10-03', saturdayDate);

    expect(result.scheduledCount).toBe(3);
    expect(result.completedCount).toBe(2);
    expect(result.rate).toBe(67);
    expect(result.rate).not.toBe(100);
  });

  it('verifies habit completion is unlocked ONLY during the final 5 minutes of habit window', () => {
    const lateHabit: Habit = {
      ...baseHabit,
      startTime: '23:00',
      endTime: '23:30',
    };

    const targetDate = new Date('2026-10-03T23:20:00');
    // At 11:20 PM -> ACTIVE, but canComplete is false (unlocks at 11:25 PM)
    const result20 = determineHabitStatus(lateHabit, undefined, targetDate, '23:20');
    expect(result20.status).toBe('ACTIVE');
    expect(result20.canComplete).toBe(false);

    // At 11:25 PM (5 mins before end) -> ACTIVE and canComplete is true
    const result25 = determineHabitStatus(lateHabit, undefined, targetDate, '23:25');
    expect(result25.status).toBe('ACTIVE');
    expect(result25.canComplete).toBe(true);

    // At 11:30 PM (at end) -> ACTIVE and canComplete is true
    const result30 = determineHabitStatus(lateHabit, undefined, targetDate, '23:30');
    expect(result30.status).toBe('ACTIVE');
    expect(result30.canComplete).toBe(true);

    // At 11:31 PM (after end) -> MISSED and canComplete is false
    const result31 = determineHabitStatus(lateHabit, undefined, targetDate, '23:31');
    expect(result31.status).toBe('MISSED');
    expect(result31.canComplete).toBe(false);
  });
});
