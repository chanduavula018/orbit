const mongoose = require('mongoose');

const DayEntrySchema = new mongoose.Schema({
  day: Number,
  date: String,
  completed: { type: Boolean, default: false },
  mood: { type: Number, min: 1, max: 5 },
  note: String,
  photoUrl: String
});

const TransformationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  totalDays: { type: Number, required: true }, // 30, 75, 100, etc.
  category: {
    type: String,
    enum: ['fitness', 'mindfulness', 'learning', 'productivity', 'health', 'creative', 'custom'],
    default: 'custom'
  },
  icon: { type: String, default: '🔥' },
  color: { type: String, default: '#f59e0b' },
  startDate: { type: String, required: true },
  endDate: { type: String },
  habits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Habit' }],
  dailyEntries: [DayEntrySchema],
  currentDay: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  milestones: [{
    day: Number,
    title: String,
    achieved: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transformation', TransformationSchema);
