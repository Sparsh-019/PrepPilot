const asyncHandler = require('express-async-handler');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');

// @desc    List quizzes, optionally filtered by category/difficulty
// @route   GET /api/quizzes?category=Aptitude&difficulty=Easy
// @access  Private
const listQuizzes = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;

  // Exclude correct answers/explanations from the list view
  const quizzes = await Quiz.find(filter).select('title category difficulty durationMinutes questions');
  const summarized = quizzes.map((q) => ({
    _id: q._id,
    title: q.title,
    category: q.category,
    difficulty: q.difficulty,
    durationMinutes: q.durationMinutes,
    questionCount: q.questions.length,
  }));

  res.json({ success: true, quizzes: summarized });
});

// @desc    Get a single quiz for attempting (answers hidden)
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizForAttempt = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  const sanitized = {
    _id: quiz._id,
    title: quiz.title,
    category: quiz.category,
    difficulty: quiz.difficulty,
    durationMinutes: quiz.durationMinutes,
    questions: quiz.questions.map((q) => ({ _id: q._id, question: q.question, options: q.options })),
  };

  res.json({ success: true, quiz: sanitized });
});

// @desc    Submit answers for a quiz and get scored result
// @route   POST /api/quizzes/:id/submit
// @access  Private
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers, timeTakenSeconds } = req.body; // answers: number[] aligned to question order

  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
    res.status(400);
    throw new Error(`Expected ${quiz.questions.length} answers`);
  }

  let correctCount = 0;
  quiz.questions.forEach((q, idx) => {
    if (answers[idx] === q.correctIndex) correctCount += 1;
  });

  const score = Math.round((correctCount / quiz.questions.length) * 100);

  const result = await QuizResult.create({
    user: req.user._id,
    quiz: quiz._id,
    answers,
    score,
    correctCount,
    totalQuestions: quiz.questions.length,
    timeTakenSeconds: timeTakenSeconds || 0,
  });

  // Update aggregate readiness score (weighted rolling average)
  req.user.readinessScore = Math.round(req.user.readinessScore * 0.7 + score * 0.3);
  req.user.streak.lastActiveDate = new Date();
  await req.user.save();

  // Include correct answers + explanations in the response for review
  const review = quiz.questions.map((q, idx) => ({
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    yourAnswer: answers[idx],
    isCorrect: answers[idx] === q.correctIndex,
    explanation: q.explanation,
  }));

  res.status(201).json({
    success: true,
    result: { score, correctCount, totalQuestions: quiz.questions.length, resultId: result._id },
    review,
  });
});

// @desc    Get current user's quiz result history
// @route   GET /api/quizzes/history/me
// @access  Private
const getMyQuizHistory = asyncHandler(async (req, res) => {
  const results = await QuizResult.find({ user: req.user._id })
    .populate('quiz', 'title category difficulty')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, results });
});

module.exports = { listQuizzes, getQuizForAttempt, submitQuiz, getMyQuizHistory };
