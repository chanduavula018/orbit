const express = require('express');
const router = express.Router();
const { getHabits, createHabit, updateHabit, deleteHabit, toggleCompletion } = require('../controllers/habitController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.route('/').get(getHabits).post(createHabit);
router.route('/:id').put(updateHabit).delete(deleteHabit);
router.post('/:id/toggle', toggleCompletion);
module.exports = router;
