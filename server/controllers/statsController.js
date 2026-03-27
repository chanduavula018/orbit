const Habit = require('../models/Habit');
const Task = require('../models/Task');
const Transformation = require('../models/Transformation');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split('T')[0];

    const habits = await Habit.find({ user: userId, isArchived: false });
    const todayHabits = habits.filter(h => {
      const comp = h.completions.find(c => c.date === today);
      return comp && comp.completed;
    });

    const tasks = await Task.find({ user: userId });
    const todayTasks = tasks.filter(t => t.dueDate === today);
    const completedTodayTasks = todayTasks.filter(t => t.status === 'completed');

    const transformations = await Transformation.find({ user: userId, isActive: true });
    const activeTransformation = transformations.find(t => !t.isCompleted);

    const totalStreak = habits.reduce((acc, h) => acc + h.streak, 0);
    const avgStreak = habits.length ? Math.round(totalStreak / habits.length) : 0;

    // Weekly habit data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const completed = habits.filter(h => h.completions.find(c => c.date === dateStr && c.completed)).length;
      weeklyData.push({ date: dateStr, completed, total: habits.length });
    }

    res.json({
      totalHabits: habits.length,
      completedToday: todayHabits.length,
      todayTasksTotal: todayTasks.length,
      todayTasksCompleted: completedTodayTasks.length,
      avgStreak,
      longestStreak: Math.max(...habits.map(h => h.longestStreak), 0),
      activeTransformation: activeTransformation ? {
        title: activeTransformation.title,
        currentDay: activeTransformation.currentDay,
        totalDays: activeTransformation.totalDays,
        progress: Math.round((activeTransformation.currentDay / activeTransformation.totalDays) * 100)
      } : null,
      weeklyData
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
