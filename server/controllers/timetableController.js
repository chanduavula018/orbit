const Timetable = require('../models/Timetable');

exports.getTimetable = async (req, res) => {
  try {
    const entries = await Timetable.find({ user: req.user._id, isActive: true }).sort({ startTime: 1 });
    res.json(entries);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createEntry = async (req, res) => {
  try {
    const entry = await Timetable.create({ ...req.body, user: req.user._id });
    res.status(201).json(entry);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateEntry = async (req, res) => {
  try {
    const entry = await Timetable.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, req.body, { new: true }
    );
    res.json(entry);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleCompletion = async (req, res) => {
  try {
    const { date } = req.body;
    const entry = await Timetable.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    const idx = entry.completions.findIndex(c => c.date === date);
    if (idx > -1) entry.completions[idx].completed = !entry.completions[idx].completed;
    else entry.completions.push({ date, completed: true });
    await entry.save();
    res.json(entry);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteEntry = async (req, res) => {
  try {
    await Timetable.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
