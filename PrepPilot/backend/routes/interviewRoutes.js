const express = require('express');
const {
  getQuestions,
  submitInterviewAttempt,
  getInterviewHistory,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/questions', getQuestions);
router.get('/history', getInterviewHistory);
router.post('/attempt', submitInterviewAttempt);

module.exports = router;
