const mongoose = require('mongoose');

const TimetableEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  startTime: { type: String, required: true }, // HH:MM
  endTime: { type: String, required: true },
  days: [{ type: Number }], // 0-6
  category: { type: String, default: 'routine' },
  color: { type: String, default: '#6366f1' },
  icon: { type: String, default: '📅' },
  completions: [{
    date: String, // YYYY-MM-DD
    completed: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Timetable', TimetableEntrySchema);
