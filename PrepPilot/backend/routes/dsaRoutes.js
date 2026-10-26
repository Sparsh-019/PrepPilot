const express = require('express');
const {
  getProgress,
  logSolvedProblem,
  deleteSolvedProblem,
  setTopicGoals,
} = require('../controllers/dsaController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getProgress);
router.post('/solve', logSolvedProblem);
router.delete('/:problemId', deleteSolvedProblem);
router.put('/goals', setTopicGoals);

module.exports = router;
