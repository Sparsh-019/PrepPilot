const asyncHandler = require('express-async-handler');
const InterviewAttempt = require('../models/InterviewAttempt');
const { gradeInterviewAnswer } = require('../services/aiService');

// A small bank of interview questions grouped by type/role. In production this
// would live in its own collection with role/difficulty tagging, but a static
// bank keeps the mock-interview feature fully functional out of the box.
const QUESTION_BANK = {
  Technical: [
    'Explain the difference between an array and a linked list, and when you would use each.',
    'What is the time complexity of your favorite sorting algorithm, and how does it achieve that?',
    'Describe a challenging bug you fixed and how you debugged it.',
    'How would you design a URL shortening service like bit.ly?',
    'What is the difference between SQL and NoSQL databases?',
  ],
  HR: [
    'Tell me about yourself.',
    'Why do you want to work at our company?',
    'What are your greatest strengths and weaknesses?',
    'Where do you see yourself in five years?',
    'Why should we hire you over other candidates?',
  ],
  Behavioral: [
    'Describe a time you worked in a team and faced a conflict. How did you resolve it?',
    'Tell me about a time you failed and what you learned from it.',
    'Describe a situation where you had to learn something new quickly.',
    'Tell me about a time you took initiative on a project.',
    'How do you handle tight deadlines and pressure?',
  ],
};

// @desc    Get a set of interview questions for a given type
// @route   GET /api/interview/questions?type=Technical
// @access  Private
const getQuestions = asyncHandler(async (req, res) => {
  const type = req.query.type || 'Technical';
  const questions = QUESTION_BANK[type] || QUESTION_BANK.Technical;
  res.json({ success: true, type, questions });
});

// @desc    Submit a full mock interview attempt (question/answer pairs) and get AI feedback
// @route   POST /api/interview/attempt
// @access  Private
const submitInterviewAttempt = asyncHandler(async (req, res) => {
  const { role, type, exchanges } = req.body; // exchanges: [{ question, answer }]

  if (!role || !Array.isArray(exchanges) || exchanges.length === 0) {
    res.status(400);
    throw new Error('role and a non-empty exchanges array are required');
  }

  const gradedExchanges = [];
  for (const ex of exchanges) {
    const feedback = await gradeInterviewAnswer(ex.question, ex.answer);
    gradedExchanges.push({ question: ex.question, answer: ex.answer, feedback });
  }

  const totalPossible = gradedExchanges.length * 30; // 3 dimensions x 10 max each
  const totalScored = gradedExchanges.reduce(
    (sum, ex) => sum + ex.feedback.clarityScore + ex.feedback.relevanceScore + ex.feedback.confidenceScore,
    0
  );
  const overallScore = Math.round((totalScored / totalPossible) * 100);

  const summary =
    overallScore >= 75
      ? 'Strong overall interview performance — keep refining specificity in your examples.'
      : overallScore >= 50
      ? 'Solid foundation — focus on structuring answers (STAR method) and adding concrete examples.'
      : 'Needs more practice — review core concepts and rehearse answers out loud before your next attempt.';

  const attempt = await InterviewAttempt.create({
    user: req.user._id,
    role,
    type: type || 'Technical',
    exchanges: gradedExchanges,
    overallScore,
    summary,
  });

  // Blend interview score into overall readiness score
  req.user.readinessScore = Math.round(req.user.readinessScore * 0.7 + overallScore * 0.3);
  req.user.streak.lastActiveDate = new Date();
  await req.user.save();

  res.status(201).json({ success: true, attempt });
});

// @desc    Get current user's interview attempt history
// @route   GET /api/interview/history
// @access  Private
const getInterviewHistory = asyncHandler(async (req, res) => {
  const attempts = await InterviewAttempt.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ success: true, attempts });
});

module.exports = { getQuestions, submitInterviewAttempt, getInterviewHistory };
