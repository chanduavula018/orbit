import { describe, it, expect } from 'vitest';
import { Habit } from '../../data/models/habit';
import { HabitCompletion } from '../../data/models/completion';
import { determineHabitStatus, validateHabitTimes } from '../services/timeEngine';
import { calculateHabitStreak } from '../services/streakEngine';
import { calculateTargetPeriodStats } from '../services/statsEngine';

describe('Habit Time Engine & Validation Tests', () => {
  const baseHabit: Habit = {
    id: 'test-gym',
    name: 'Gym',
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
    reminderMinutes: 5,
    isPaused: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('validates start and end time inputs', () => {
    expect(validateHabitTimes('06:00', '06:30').isValid).toBe(true);
    expect(validateHabitTimes('06:00', '06:00').isValid).toBe(false);
  });

  it('returns UPCOMING when current time is before window', () => {
    const targetDate = new Date('2026-09-30T05:50:00');
    const result = determineHabitStatus(baseHabit, undefined, targetDate, '05:50');
    
    expect(result.status).toBe('UPCOMING');
    expect(result.canComplete).toBe(false);
    expect(result.label).toContain('Starts in');
  });

  it('returns ACTIVE when current time is inside valid window, but canComplete is true ONLY in final 5 mins', () => {
    // 06:00 - 06:30. Final 5 mins is 06:25 - 06:30
    const beforeFinal5 = new Date('2026-09-30T06:15:00');
    const result15 = determineHabitStatus(baseHabit, undefined, beforeFinal5, '06:15');
    expect(result15.status).toBe('ACTIVE');
    expect(result15.canComplete).toBe(false);

    const insideFinal5 = new Date('2026-09-30T06:26:00');
    const result26 = determineHabitStatus(baseHabit, undefined, insideFinal5, '06:26');
    expect(result26.status).toBe('ACTIVE');
    expect(result26.canComplete).toBe(true);
  });

  it('returns MISSED when current time is after window', () => {
    const targetDate = new Date('2026-09-30T06:35:00');
    const result = determineHabitStatus(baseHabit, undefined, targetDate, '06:35');
    
    expect(result.status).toBe('MISSED');
    expect(result.canComplete).toBe(false);
  });

  it('exact final 5-minutes completion window test (11:00 PM - 11:30 PM)', () => {
    const runHabit: Habit = {
      ...baseHabit,
      startTime: '23:00',
      endTime: '23:30',
      reminderMinutes: 5,
    };

    // 10:59 PM -> UPCOMING, canComplete = false
    const t1059 = determineHabitStatus(runHabit, undefined, new Date('2026-10-03T22:59:00'), '22:59');
    expect(t1059.status).toBe('UPCOMING');
    expect(t1059.canComplete).toBe(false);

    // 11:00 PM -> ACTIVE, canComplete = false
    const t1100 = determineHabitStatus(runHabit, undefined, new Date('2026-10-03T23:00:00'), '23:00');
    expect(t1100.status).toBe('ACTIVE');
    expect(t1100.canComplete).toBe(false);

    // 11:20 PM -> ACTIVE, canComplete = false
    const t1120 = determineHabitStatus(runHabit, undefined, new Date('2026-10-03T23:20:00'), '23:20');
    expect(t1120.status).toBe('ACTIVE');
    expect(t1120.canComplete).toBe(false);

    // 11:24 PM -> ACTIVE, canComplete = false
    const t1124 = determineHabitStatus(runHabit, undefined, new Date('2026-10-03T23:24:00'), '23:24');
    expect(t1124.status).toBe('ACTIVE');
    expect(t1124.canComplete).toBe(false);

    // 11:25 PM -> ACTIVE, canComplete = true (Unlocks at endTime - 5 mins)
    const t1125 = determineHabitStatus(runHabit, undefined, new Date('2026-10-03T23:25:00'), '23:25');
    expect(t1125.status).toBe('ACTIVE');
    expect(t1125.canComplete).toBe(true);

    // 11:29 PM -> ACTIVE, canComplete = true
    const t1129 = determineHabitStatus(runHabit, undefined, new Date('2026-10-03T23:29:00'), '23:29');
    expect(t1129.status).toBe('ACTIVE');
    expect(t1129.canComplete).toBe(true);

    // 11:30 PM -> ACTIVE, canComplete = true
    const t1130 = determineHabitStatus(runHabit, undefined, new Date('2026-10-03T23:30:00'), '23:30');
    expect(t1130.status).toBe('ACTIVE');
    expect(t1130.canComplete).toBe(true);

    // 11:31 PM -> MISSED, canComplete = false
    const t1131 = determineHabitStatus(runHabit, undefined, new Date('2026-10-03T23:31:00'), '23:31');
    expect(t1131.status).toBe('MISSED');
    expect(t1131.canComplete).toBe(false);
  });

  it('reminder time does NOT control completion (8:55 AM vs 9:00 AM vs 9:55 AM)', () => {
    const studyHabit: Habit = {
      ...baseHabit,
      startTime: '09:00',
      endTime: '10:00',
      reminderMinutes: 5,
    };

    // Reminder triggers at 8:55 AM -> UPCOMING (cannot complete yet)
    const atReminderTime = determineHabitStatus(studyHabit, undefined, new Date('2026-10-03T08:55:00'), '08:55');
    expect(atReminderTime.status).toBe('UPCOMING');
    expect(atReminderTime.canComplete).toBe(false);

    // Window opens at 9:00 AM -> ACTIVE (cannot complete until 9:55 AM)
    const atWindowStart = determineHabitStatus(studyHabit, undefined, new Date('2026-10-03T09:00:00'), '09:00');
    expect(atWindowStart.status).toBe('ACTIVE');
    expect(atWindowStart.canComplete).toBe(false);

    // Completion opens at 9:55 AM -> ACTIVE (can complete)
    const atCompletionWindow = determineHabitStatus(studyHabit, undefined, new Date('2026-10-03T09:55:00'), '09:55');
    expect(atCompletionWindow.status).toBe('ACTIVE');
    expect(atCompletionWindow.canComplete).toBe(true);
  });

  it('correctly handles cross-midnight habits (23:30 - 00:15)', () => {
    const nightHabit: Habit = {
      ...baseHabit,
      startTime: '23:30',
      endTime: '00:15',
    };

    // 23:45 -> ACTIVE, canComplete = false (final 5 mins is 00:10 - 00:15)
    const activeResult = determineHabitStatus(nightHabit, undefined, new Date('2026-09-30T23:45:00'), '23:45');
    expect(activeResult.status).toBe('ACTIVE');
    expect(activeResult.canComplete).toBe(false);

    // 00:12 -> ACTIVE, canComplete = true
    const midnightResult = determineHabitStatus(nightHabit, undefined, new Date('2026-10-01T00:12:00'), '00:12');
    expect(midnightResult.status).toBe('ACTIVE');
    expect(midnightResult.canComplete).toBe(true);

    // 01:00 -> MISSED, canComplete = false
    const expiredResult = determineHabitStatus(nightHabit, undefined, new Date('2026-10-01T01:00:00'), '01:00');
    expect(expiredResult.status).toBe('MISSED');
    expect(expiredResult.canComplete).toBe(false);
  });
});

describe('Habit Streak & Target Period Statistics Tests', () => {
  const weekdayHabit: Habit = {
    id: 'test-reading',
    name: 'Reading',
    icon: '📖',
    color: '#8b5cf6',
    category: 'Personal',
    startTime: '21:00',
    endTime: '21:30',
    repeatType: 'weekdays',
    selectedDays: [1, 2, 3, 4, 5], // Mon..Fri
    targetType: 'none',
    startDate: '2026-09-01',
    reminderMinutes: 15,
    isPaused: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('calculates current streak correctly for consecutive completed days', () => {
    const completions: HabitCompletion[] = [
      { id: 'c1', habitId: 'test-reading', date: '2026-09-28', status: 'COMPLETED' }, // Mon
      { id: 'c2', habitId: 'test-reading', date: '2026-09-29', status: 'COMPLETED' }, // Tue
      { id: 'c3', habitId: 'test-reading', date: '2026-09-30', status: 'COMPLETED' }, // Wed
    ];

    const stats = calculateHabitStreak(weekdayHabit, completions, new Date('2026-09-30'));
    expect(stats.currentStreak).toBe(3);
    expect(stats.totalCompleted).toBe(3);
  });

  it('does NOT break streak for unscheduled weekend days (Sat/Sun)', () => {
    const completions: HabitCompletion[] = [
      { id: 'c1', habitId: 'test-reading', date: '2026-09-25', status: 'COMPLETED' }, // Fri
      { id: 'c2', habitId: 'test-reading', date: '2026-09-28', status: 'COMPLETED' }, // Mon
    ];

    const stats = calculateHabitStreak(weekdayHabit, completions, new Date('2026-09-28'));
    expect(stats.currentStreak).toBe(2);
  });

  it('resets streak to 0 when a scheduled day is MISSED', () => {
    const completions: HabitCompletion[] = [
      { id: 'c1', habitId: 'test-reading', date: '2026-09-28', status: 'COMPLETED' }, // Mon
      { id: 'c2', habitId: 'test-reading', date: '2026-09-29', status: 'MISSED' },    // Tue missed!
      { id: 'c3', habitId: 'test-reading', date: '2026-09-30', status: 'COMPLETED' }, // Wed
    ];

    const stats = calculateHabitStreak(weekdayHabit, completions, new Date('2026-09-30'));
    expect(stats.currentStreak).toBe(1);
    expect(stats.totalCompleted).toBe(2);
    expect(stats.totalMissed).toBe(1);
  });

  it('does NOT break streak when habit is PAUSED', () => {
    const pausedHabit: Habit = { ...weekdayHabit, isPaused: true };
    const completions: HabitCompletion[] = [
      { id: 'c1', habitId: 'test-reading', date: '2026-09-28', status: 'COMPLETED' },
    ];

    const stats = calculateHabitStreak(pausedHabit, completions, new Date('2026-09-30'));
    expect(stats.currentStreak).toBe(1);
  });

  it('verifies statistics do NOT include dates before habit start date', () => {
    const habit: Habit = {
      ...weekdayHabit,
      startDate: '2026-10-10',
      repeatType: 'daily',
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
    };

    const completions: HabitCompletion[] = [
      { id: 'c1', habitId: habit.id, date: '2026-10-10', status: 'COMPLETED' },
      { id: 'c2', habitId: habit.id, date: '2026-10-11', status: 'COMPLETED' },
    ];

    const stats = calculateTargetPeriodStats(habit, completions, new Date('2026-10-12T23:59:00'));
    expect(stats.totalScheduledOpportunities).toBe(3);
    expect(stats.totalCompleted).toBe(2);
    expect(stats.totalMissed).toBe(1);
    expect(stats.completionRate).toBe(67);
  });
});
