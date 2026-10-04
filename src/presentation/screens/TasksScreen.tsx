import React, { useState } from 'react';
import { useHabits } from '../context/HabitContext';
import { useSettings } from '../context/SettingsContext';
import { Task, TaskType } from '../../data/models/task';
import { TaskFormModal } from '../components/TaskFormModal';
import { formatDateToISO } from '../../core/utilities/dateUtils';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  isBefore,
  parseISO
} from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Check, Calendar as CalendarIcon, 
  Clock, Plus, Trash2, Edit3, AlertCircle, ListTodo 
} from 'lucide-react';

export const TasksScreen: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion, currentTime } = useHabits();
  const { settings } = useSettings();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Task form modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [modalTaskType, setModalTaskType] = useState<TaskType>('CALENDAR');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: settings.startOfWeek === 1 ? 1 : 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: settings.startOfWeek === 1 ? 1 : 0 });

  const daysGrid = eachDayOfInterval({ start: startDate, end: endDate });
  const selectedDateStr = formatDateToISO(selectedDate);
  const todayStr = formatDateToISO(currentTime);

  // SECTION A: CALENDAR TASKS (Filtered ONLY for selected calendar date)
  const calendarTasks = tasks.filter(t => (t.taskType === 'CALENDAR' || t.date) && t.taskType !== 'GENERAL');
  const selectedDateCalendarTasks = calendarTasks.filter(t => t.date === selectedDateStr);
  const completedCalendarCount = selectedDateCalendarTasks.filter(t => t.completed).length;

  // SECTION B: GENERAL TASKS (Standalone checklist independent of calendar dates)
  const generalTasks = tasks.filter(t => t.taskType === 'GENERAL' || (!t.taskType && !t.date));

  const handleOpenAddCalendarTask = () => {
    setEditingTask(null);
    setModalTaskType('CALENDAR');
    setIsTaskModalOpen(true);
  };

  const handleOpenAddGeneralTask = () => {
    setEditingTask(null);
    setModalTaskType('GENERAL');
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setModalTaskType(task.taskType || (task.date ? 'CALENDAR' : 'GENERAL'));
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'> & { id?: string }) => {
    if (taskData.id) {
      const existing = tasks.find(t => t.id === taskData.id);
      if (existing) {
        await updateTask({
          ...existing,
          ...taskData,
        });
      }
    } else {
      await addTask(taskData);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          Tasks & Deadlines
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          One-time tasks and personal checklist
        </p>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: CALENDAR TASKS */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4" />
            <span>CALENDAR TASKS</span>
          </h3>
          <button
            onClick={handleOpenAddCalendarTask}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1 active-touch"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Add Calendar Task</span>
          </button>
        </div>

        {/* Month Calendar Component */}
        <div className="bg-white dark:bg-[#202124] rounded-3xl p-5 border border-slate-200 dark:border-[#2F2F33] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{format(currentMonth, 'MMMM yyyy')}</span>
            </h4>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272A] text-slate-600 dark:text-slate-300 transition-colors"
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#27272A] text-slate-600 dark:text-slate-300 transition-colors"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {(settings.startOfWeek === 1 
              ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] 
              : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
            ).map(d => (
              <span key={d} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {daysGrid.map((day) => {
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonthDay = isSameMonth(day, monthStart);
              const isToday = isSameDay(day, new Date());
              const dayStr = formatDateToISO(day);

              // Calendar Tasks ONLY for this date (General Tasks do NOT create dots!)
              const dayCalTasks = calendarTasks.filter(t => t.date === dayStr);
              const hasCalTasks = dayCalTasks.length > 0;
              const allCalCompleted = hasCalTasks && dayCalTasks.every(t => t.completed);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`h-10 rounded-2xl flex flex-col items-center justify-center relative transition-all active-touch ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-extrabold shadow-md shadow-indigo-600/30 scale-105'
                      : isToday
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold border border-indigo-300 dark:border-indigo-800'
                      : isCurrentMonthDay
                      ? 'hover:bg-slate-100 dark:hover:bg-[#27272A] text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                >
                  <span className="text-xs">{format(day, 'd')}</span>

                  {/* Calendar Task Indicator Dot ONLY */}
                  {isCurrentMonthDay && hasCalTasks && (
                    <span className="flex items-center justify-center mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isSelected 
                          ? 'bg-white' 
                          : allCalCompleted 
                          ? 'bg-emerald-500' 
                          : 'bg-indigo-500'
                      }`} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Detail View Header */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#202124] border border-slate-200 dark:border-[#2F2F33] shadow-sm flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
              {format(selectedDate, 'EEEE, MMMM d')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {completedCalendarCount} of {selectedDateCalendarTasks.length} calendar tasks completed
            </p>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-[#27272A] text-slate-700 dark:text-slate-300">
            {selectedDateCalendarTasks.length} {selectedDateCalendarTasks.length === 1 ? 'Task' : 'Tasks'}
          </span>
        </div>

        {/* Selected Date Calendar Tasks List */}
        <div className="space-y-2.5">
          {selectedDateCalendarTasks.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-[#202124] rounded-3xl border border-slate-200 dark:border-[#2F2F33] space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                No calendar tasks for this date.
              </p>
              <button
                onClick={handleOpenAddCalendarTask}
                className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 inline-flex items-center gap-1.5 active-touch"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Add Calendar Task</span>
              </button>
            </div>
          ) : (
            selectedDateCalendarTasks.map((task) => {
              const isOverdue = !task.completed && task.date && isBefore(parseISO(task.date), parseISO(todayStr));

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-3xl bg-white dark:bg-[#202124] border transition-all shadow-sm flex items-center justify-between gap-3 ${
                    task.completed 
                      ? 'border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10' 
                      : isOverdue 
                      ? 'border-rose-200 dark:border-rose-900/60' 
                      : 'border-slate-200 dark:border-[#2F2F33]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleTaskCompletion(task.id)}
                      className={`w-6 h-6 rounded-xl flex items-center justify-center border-2 shrink-0 mt-0.5 transition-all ${
                        task.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-[#27272A]'
                      }`}
                      aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="min-w-0 flex-1 cursor-pointer" onClick={() => handleOpenEditTask(task)}>
                      <h5 className={`font-bold text-sm leading-snug ${
                        task.completed 
                          ? 'line-through text-slate-400 dark:text-slate-500' 
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h5>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 font-medium">
                          {task.description}
                        </p>
                      )}

                      {(task.startTime || task.deadline) && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          {task.startTime && <span>Start: {task.startTime}</span>}
                          {task.startTime && task.deadline && <span>•</span>}
                          {task.deadline && <span>Deadline: {task.deadline}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {task.completed ? (
                      <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                        Completed
                      </span>
                    ) : isOverdue ? (
                      <span className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800/60 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Overdue
                      </span>
                    ) : null}

                    <button
                      onClick={() => handleOpenEditTask(task)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="Edit task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION B: GENERAL TASKS (MY TASKS) */}
      {/* ========================================================================= */}
      <section className="space-y-3 pt-4 border-t border-slate-200 dark:border-[#2F2F33]">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ListTodo className="w-4 h-4 text-indigo-500" />
            <span>MY TASKS</span>
          </h3>
          <button
            onClick={handleOpenAddGeneralTask}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1 active-touch"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Add Task</span>
          </button>
        </div>

        {/* General Tasks Checklist List */}
        <div className="space-y-2.5">
          {generalTasks.length === 0 ? (
            <div className="p-6 text-center bg-white dark:bg-[#202124] rounded-3xl border border-slate-200 dark:border-[#2F2F33] space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                No tasks yet.
              </p>
              <button
                onClick={handleOpenAddGeneralTask}
                className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-extrabold text-xs shadow-md inline-flex items-center gap-1.5 active-touch"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Add Task</span>
              </button>
            </div>
          ) : (
            generalTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-3xl bg-white dark:bg-[#202124] border transition-all shadow-sm flex items-center justify-between gap-3 ${
                  task.completed 
                    ? 'border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/20 dark:bg-emerald-950/10' 
                    : 'border-slate-200 dark:border-[#2F2F33]'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleTaskCompletion(task.id)}
                    className={`w-6 h-6 rounded-xl flex items-center justify-center border-2 shrink-0 mt-0.5 transition-all ${
                      task.completed
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-[#27272A]'
                    }`}
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1 cursor-pointer" onClick={() => handleOpenEditTask(task)}>
                    <h5 className={`font-bold text-sm leading-snug ${
                      task.completed 
                        ? 'line-through text-slate-400 dark:text-slate-500' 
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {task.title}
                    </h5>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 font-medium">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEditTask(task)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Edit task"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Task Creation / Editing Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        taskType={modalTaskType}
        initialDate={selectedDate}
        editingTask={editingTask}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />
    </div>
  );
};
