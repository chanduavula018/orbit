import React, { useState, useEffect } from 'react';
import { Task, TaskType } from '../../data/models/task';
import { X, Calendar, Clock, Check } from 'lucide-react';
import { formatDateToISO } from '../../core/utilities/dateUtils';

interface TaskFormModalProps {
  isOpen: boolean;
  taskType: TaskType;
  initialDate?: Date;
  editingTask?: Task | null;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'> & { id?: string }) => Promise<void>;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  taskType,
  initialDate = new Date(),
  editingTask,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [startTime, setStartTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description || '');
        setDateStr(editingTask.date || formatDateToISO(initialDate));
        setStartTime(editingTask.startTime || '');
        setDeadline(editingTask.deadline || '');
      } else {
        setTitle('');
        setDescription('');
        setDateStr(formatDateToISO(initialDate));
        setStartTime('');
        setDeadline('');
      }
      setError(null);
    }
  }, [isOpen, editingTask, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (taskType === 'CALENDAR' && !dateStr) {
      setError('Date is required for calendar tasks');
      return;
    }

    try {
      await onSave({
        ...(editingTask ? { id: editingTask.id } : {}),
        taskType,
        title: title.trim(),
        description: description.trim() || undefined,
        ...(taskType === 'CALENDAR' ? {
          date: dateStr,
          startTime: startTime || undefined,
          deadline: deadline || undefined,
        } : {}),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#18181B] w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-[#2F2F33] space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2F2F33]">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 stroke-[3]" />
            <span>
              {editingTask 
                ? `Edit ${taskType === 'CALENDAR' ? 'Calendar Task' : 'Task'}` 
                : `Add ${taskType === 'CALENDAR' ? 'Calendar Task' : 'General Task'}`}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-[#27272A] text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Task Title *
            </label>
            <input
              type="text"
              placeholder={taskType === 'CALENDAR' ? "e.g. Submit project assignment, Attend meeting" : "e.g. Complete Java practice, Revise DBMS"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Description (Optional)
            </label>
            <textarea
              placeholder="Add notes or details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
            />
          </div>

          {/* Date & Time selection ONLY for CALENDAR tasks */}
          {taskType === 'CALENDAR' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Target Date *</span>
                </label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Start Time</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>Deadline</span>
                  </label>
                  <input
                    type="time"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl bg-slate-50 dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 active-touch"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{editingTask ? 'Save Changes' : 'Save Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
