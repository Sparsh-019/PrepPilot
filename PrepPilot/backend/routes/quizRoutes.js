const express = require('express');
const {
  listQuizzes,
  getQuizForAttempt,
  submitQuiz,
  getMyQuizHistory,
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', listQuizzes);
router.get('/history/me', getMyQuizHistory);
router.get('/:id', getQuizForAttempt);
router.post('/:id/submit', submitQuiz);

module.exports = router;
