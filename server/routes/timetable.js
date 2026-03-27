const express = require('express');
const router = express.Router();
const { getTimetable, createEntry, updateEntry, toggleCompletion, deleteEntry } = require('../controllers/timetableController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.route('/').get(getTimetable).post(createEntry);
router.route('/:id').put(updateEntry).delete(deleteEntry);
router.post('/:id/toggle', toggleCompletion);
module.exports = router;
