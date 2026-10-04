import React, { useState, useEffect } from 'react';
import { Habit, RepeatType, TargetType } from '../../data/models/habit';
import { HABIT_ICONS, HABIT_CATEGORIES, HABIT_COLORS } from '../../core/constants/habits';
import { validateHabitTimes } from '../../domain/services/timeEngine';
import { X, Clock, Calendar, Bell, Check, Sparkles } from 'lucide-react';
import { formatDateToISO } from '../../core/utilities/dateUtils';
import { addDays } from 'date-fns';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'> | Habit) => Promise<void>;
  editingHabit?: Habit | null;
}

export const HabitFormModal: React.FC<HabitFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingHabit
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🏋️');
  const [color, setColor] = useState('#4f46e5');
  const [category, setCategory] = useState('Fitness');
  const [startTime, setStartTime] = useState('06:00');
  const [endTime, setEndTime] = useState('06:30');
  const [reminderMinutes, setReminderMinutes] = useState(5);
  const [repeatType, setRepeatType] = useState<RepeatType>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [targetType, setTargetType] = useState<TargetType>('days');
  const [targetDays, setTargetDays] = useState<number>(30);
  const [targetDateStr, setTargetDateStr] = useState<string>(formatDateToISO(addDays(new Date(), 30)));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setDescription(editingHabit.description || '');
      setIcon(editingHabit.icon);
      setColor(editingHabit.color);
      setCategory(editingHabit.category);
      setStartTime(editingHabit.startTime);
      setEndTime(editingHabit.endTime);
      setReminderMinutes(editingHabit.reminderMinutes);
      setRepeatType(editingHabit.repeatType);
      setSelectedDays(editingHabit.selectedDays);
      setTargetType(editingHabit.targetType);
      if (editingHabit.targetType === 'days') {
        setTargetDays(typeof editingHabit.targetValue === 'number' ? editingHabit.targetValue : 30);
      } else if (editingHabit.targetType === 'date' && editingHabit.targetValue) {
        setTargetDateStr(String(editingHabit.targetValue));
      }
    } else {
      // Defaults for new habit
      setName('');
      setDescription('');
      setIcon('🏋️');
      setColor('#4f46e5');
      setCategory('Fitness');
      setStartTime('06:00');
      setEndTime('06:30');
      setReminderMinutes(5);
      setRepeatType('daily');
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      setTargetType('days');
      setTargetDays(30);
      setTargetDateStr(formatDateToISO(addDays(new Date(), 30)));
    }
    setErrorMsg(null);
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const toggleCustomDay = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Must select at least 1 day
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleRepeatChange = (type: RepeatType) => {
    setRepeatType(type);
    if (type === 'daily') setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    else if (type === 'weekdays') setSelectedDays([1, 2, 3, 4, 5]);
    else if (type === 'weekends') setSelectedDays([0, 6]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validation
    if (!name.trim()) {
      setErrorMsg('Please enter a habit name.');
      return;
    }

    const timeValidation = validateHabitTimes(startTime, endTime);
    if (!timeValidation.isValid) {
      setErrorMsg(timeValidation.error || 'Invalid habit time window.');
      return;
    }

    setIsSubmitting(true);

    let calculatedEndDate: string | null = null;
    let targetVal: number | string | null = null;

    if (targetType === 'days') {
      targetVal = targetDays;
      calculatedEndDate = formatDateToISO(addDays(new Date(), targetDays));
    } else if (targetType === 'date') {
      targetVal = targetDateStr;
      calculatedEndDate = targetDateStr;
    }

    const habitPayload = {
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      category,
      startTime,
      endTime,
      repeatType,
      selectedDays,
      targetType,
      targetValue: targetVal,
      startDate: editingHabit ? editingHabit.startDate : formatDateToISO(new Date()),
      endDate: calculatedEndDate,
      reminderMinutes,
      isPaused: editingHabit ? editingHabit.isPaused : false,
      isActive: editingHabit ? editingHabit.isActive : true,
    };

    try {
      if (editingHabit) {
        await onSave({ ...editingHabit, ...habitPayload });
      } else {
        await onSave(habitPayload);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysOfWeekNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {editingHabit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <X className="w-4 h-4 shrink-0 stroke-[3]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Name & Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Habit Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Gym, Study Coding"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-semibold text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. 30 minutes intense workout"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white text-sm"
            />
          </div>

          {/* Icon Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Select Icon / Emoji
            </label>
            <div className="grid grid-cols-8 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 max-h-36 overflow-y-auto no-scrollbar">
              {HABIT_ICONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    icon === emoji 
                      ? 'bg-indigo-600 text-white shadow-md scale-110' 
                      : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Theme Color
            </label>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
              {HABIT_COLORS.map((hex) => (
                <button
                  type="button"
                  key={hex}
                  onClick={() => setColor(hex)}
                  className={`w-8 h-8 rounded-full transition-transform shrink-0 flex items-center justify-center ${
                    color === hex ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900' : ''
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {color === hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {HABIT_CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => {
                    setCategory(cat.name);
                    setColor(cat.color);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                    category === cat.name
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Window (Start & End Time) */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-extrabold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Valid Completion Time Window</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Reminder Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-600" />
              <span>Early Reminder</span>
            </label>
            <select
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-sm"
            >
              <option value={0}>No reminder</option>
              <option value={5}>5 minutes before start</option>
              <option value={10}>10 minutes before start</option>
              <option value={15}>15 minutes before start</option>
              <option value={30}>30 minutes before start</option>
            </select>
          </div>

          {/* Repeat Pattern */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Repeat Frequency
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {(['daily', 'weekdays', 'weekends', 'custom'] as RepeatType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleRepeatChange(type)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                    repeatType === type
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Custom Day Checkbox Grid */}
            {repeatType === 'custom' && (
              <div className="flex items-center justify-between gap-1 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                {daysOfWeekNames.map((dayName, idx) => {
                  const isSelected = selectedDays.includes(idx);
                  return (
                    <button
                      type="button"
                      key={dayName}
                      onClick={() => toggleCustomDay(idx)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {dayName[0]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Target System */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Goal Target</span>
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { type: 'days', label: 'Number of Days' },
                { type: 'date', label: 'Until Date' },
                { type: 'none', label: 'No End Date' }
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setTargetType(item.type as TargetType)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    targetType === item.type
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {targetType === 'days' && (
              <div>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={targetDays}
                  onChange={(e) => setTargetDays(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-900 dark:text-white"
                  placeholder="Target days e.g. 30"
                />
              </div>
            )}

            {targetType === 'date' && (
              <div>
                <input
                  type="date"
                  value={targetDateStr}
                  onChange={(e) => setTargetDateStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition-colors active-touch disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingHabit ? 'Update Habit' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
