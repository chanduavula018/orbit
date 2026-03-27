const express = require('express');
const router = express.Router();
const { getTransformations, createTransformation, logDay, deleteTransformation } = require('../controllers/transformationController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.route('/').get(getTransformations).post(createTransformation);
router.route('/:id').delete(deleteTransformation);
router.post('/:id/log', logDay);
module.exports = router;
