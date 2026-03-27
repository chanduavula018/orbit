const Transformation = require('../models/Transformation');

exports.getTransformations = async (req, res) => {
  try {
    const items = await Transformation.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createTransformation = async (req, res) => {
  try {
    const { totalDays, startDate, ...rest } = req.body;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + totalDays - 1);

    // Pre-generate milestones
    const milestones = [];
    const mDays = [7, 14, 21, 30, 50, 75, 100].filter(d => d <= totalDays);
    mDays.forEach(d => milestones.push({ day: d, title: `Day ${d} Milestone 🎯`, achieved: false }));

    const t = await Transformation.create({
      ...rest, user: req.user._id, totalDays, startDate,
      endDate: end.toISOString().split('T')[0], milestones
    });
    res.status(201).json(t);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.logDay = async (req, res) => {
  try {
    const { day, date, mood, note, completed } = req.body;
    const t = await Transformation.findOne({ _id: req.params.id, user: req.user._id });
    if (!t) return res.status(404).json({ message: 'Not found' });

    const idx = t.dailyEntries.findIndex(e => e.day === day);
    if (idx > -1) Object.assign(t.dailyEntries[idx], { mood, note, completed, date });
    else t.dailyEntries.push({ day, date, mood, note, completed });

    t.currentDay = t.dailyEntries.filter(e => e.completed).length;

    // Check milestones
    t.milestones.forEach(m => { if (t.currentDay >= m.day) m.achieved = true; });
    if (t.currentDay >= t.totalDays) t.isCompleted = true;

    await t.save();
    res.json(t);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteTransformation = async (req, res) => {
  try {
    await Transformation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
