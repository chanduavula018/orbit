const mongoose = require('mongoose');

const CompletionSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  completed: { type: Boolean, default: false },
  note: { type: String, default: '' }
});

const HabitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '⭐' },
  color: { type: String, default: '#6366f1' },
  category: {
    type: String,
    enum: ['health', 'fitness', 'mindfulness', 'learning', 'productivity', 'social', 'creative', 'finance', 'other'],
    default: 'other'
  },
  frequency: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
  targetDays: [{ type: Number }], // 0=Sun ... 6=Sat for weekly
  reminderTime: { type: String, default: '' },
  completions: [CompletionSchema],
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  totalCompleted: { type: Number, default: 0 },
  isArchived: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Habit', HabitSchema);
