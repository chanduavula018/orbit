const Habit = require('../models/Habit');

exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id, isArchived: false }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createHabit = async (req, res) => {
  try {
    const habit = await Habit.create({ ...req.body, user: req.user._id });
    res.status(201).json(habit);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true }
    );
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json(habit);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteHabit = async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Habit deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleCompletion = async (req, res) => {
  try {
    const { date } = req.body;
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const existingIdx = habit.completions.findIndex(c => c.date === date);
    if (existingIdx > -1) {
      habit.completions[existingIdx].completed = !habit.completions[existingIdx].completed;
    } else {
      habit.completions.push({ date, completed: true });
    }

    // Recalculate streak
    habit.totalCompleted = habit.completions.filter(c => c.completed).length;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const comp = habit.completions.find(c => c.date === dateStr);
      if (comp && comp.completed) streak++;
      else break;
    }
    habit.streak = streak;
    if (streak > habit.longestStreak) habit.longestStreak = streak;

    await habit.save();
    res.json(habit);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
