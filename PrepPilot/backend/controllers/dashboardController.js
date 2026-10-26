const asyncHandler = require('express-async-handler');
const DSAProgress = require('../models/DSAProgress');
const QuizResult = require('../models/QuizResult');
const Resume = require('../models/Resume');
const InterviewAttempt = require('../models/InterviewAttempt');
const { generateRoadmap } = require('../services/aiService');

// @desc    Get an aggregated dashboard snapshot for the current student
// @route   GET /api/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [dsaProgress, quizResults, latestResume, interviewAttempts] = await Promise.all([
    DSAProgress.findOne({ user: userId }),
    QuizResult.find({ user: userId }).sort({ createdAt: -1 }).limit(20),
    Resume.findOne({ user: userId }).sort({ createdAt: -1 }).select('-rawText'),
    InterviewAttempt.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
  ]);

  const dsaScore = dsaProgress ? dsaProgress.computeScore() : 0;
  const dsaBreakdown = dsaProgress ? dsaProgress.getTopicBreakdown() : {};
  const totalSolved = dsaProgress ? dsaProgress.solvedProblems.length : 0;

  const avgQuizScore =
    quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length)
      : 0;

  const atsScore = latestResume ? latestResume.analysis.atsScore : 0;

  const avgInterviewScore =
    interviewAttempts.length > 0
      ? Math.round(interviewAttempts.reduce((sum, a) => sum + a.overallScore, 0) / interviewAttempts.length)
      : 0;

  // Weighted readiness score combining all four pillars from the slides:
  // DSA progress, quiz/aptitude performance, resume ATS score, interview feedback
  const readinessScore = Math.round(
    dsaScore * 0.3 + avgQuizScore * 0.25 + atsScore * 0.2 + avgInterviewScore * 0.25
  );

  // Persist the freshly computed aggregate onto the user record
  req.user.readinessScore = readinessScore;
  await req.user.save();

  // Identify weak topics (lowest solved counts) to hand to the roadmap generator
  const allTopics = ['Arrays', 'Strings', 'DynamicProgramming', 'Graphs', 'Trees', 'LinkedList'];
  const weakTopics = allTopics
    .map((t) => ({ topic: t, count: dsaBreakdown[t] || 0 }))
    .sort((a, b) => a.count - b.count)
    .slice(0, 3)
    .map((t) => t.topic);

  const roadmap = await generateRoadmap({
    targetRole: req.user.targetRole || 'SDE',
    dsaBreakdown,
    avgQuizScore,
    weakTopics,
  });

  res.json({
    success: true,
    dashboard: {
      readinessScore,
      pillars: { dsaScore, avgQuizScore, atsScore, avgInterviewScore },
      dsa: { totalSolved, topicBreakdown: dsaBreakdown },
      quizzesTaken: quizResults.length,
      latestResume,
      interviewAttemptsTaken: interviewAttempts.length,
      roadmap,
      streak: req.user.streak,
    },
  });
});

module.exports = { getDashboard };
