const asyncHandler = require('express-async-handler');
const DSAProgress = require('../models/DSAProgress');
const User = require('../models/User');

// @desc    Get current user's DSA progress
// @route   GET /api/dsa
// @access  Private
const getProgress = asyncHandler(async (req, res) => {
  let progress = await DSAProgress.findOne({ user: req.user._id });
  if (!progress) {
    progress = await DSAProgress.create({ user: req.user._id, solvedProblems: [] });
  }

  res.json({
    success: true,
    progress: {
      _id: progress._id,
      totalSolved: progress.solvedProblems.length,
      topicBreakdown: progress.getTopicBreakdown(),
      score: progress.computeScore(),
      solvedProblems: progress.solvedProblems.sort((a, b) => b.solvedAt - a.solvedAt),
      topicGoals: progress.topicGoals,
    },
  });
});

// @desc    Log a newly solved DSA problem
// @route   POST /api/dsa/solve
// @access  Private
const logSolvedProblem = asyncHandler(async (req, res) => {
  const { title, topic, difficulty, platform, url, timeTakenMinutes } = req.body;

  if (!title || !topic) {
    res.status(400);
    throw new Error('title and topic are required');
  }

  let progress = await DSAProgress.findOne({ user: req.user._id });
  if (!progress) {
    progress = await DSAProgress.create({ user: req.user._id, solvedProblems: [] });
  }

  progress.solvedProblems.push({ title, topic, difficulty, platform, url, timeTakenMinutes });
  await progress.save();

  // Update the user's aggregate readiness score contribution
  const dsaScore = progress.computeScore();
  req.user.readinessScore = Math.round(req.user.readinessScore * 0.7 + dsaScore * 0.3);
  req.user.streak.lastActiveDate = new Date();
  await req.user.save();

  res.status(201).json({
    success: true,
    totalSolved: progress.solvedProblems.length,
    topicBreakdown: progress.getTopicBreakdown(),
    score: dsaScore,
  });
});

// @desc    Delete a logged problem (e.g. mis-entry correction)
// @route   DELETE /api/dsa/:problemId
// @access  Private
const deleteSolvedProblem = asyncHandler(async (req, res) => {
  const progress = await DSAProgress.findOne({ user: req.user._id });
  if (!progress) {
    res.status(404);
    throw new Error('No DSA progress found');
  }

  progress.solvedProblems = progress.solvedProblems.filter(
    (p) => p._id.toString() !== req.params.problemId
  );
  await progress.save();

  res.json({ success: true, totalSolved: progress.solvedProblems.length });
});

// @desc    Set per-topic practice goals
// @route   PUT /api/dsa/goals
// @access  Private
const setTopicGoals = asyncHandler(async (req, res) => {
  const { goals } = req.body; // { Arrays: 30, Graphs: 20, ... }
  if (!goals || typeof goals !== 'object') {
    res.status(400);
    throw new Error('goals object is required');
  }

  let progress = await DSAProgress.findOne({ user: req.user._id });
  if (!progress) {
    progress = await DSAProgress.create({ user: req.user._id, solvedProblems: [] });
  }

  progress.topicGoals = new Map(Object.entries(goals));
  await progress.save();

  res.json({ success: true, topicGoals: progress.topicGoals });
});

module.exports = { getProgress, logSolvedProblem, deleteSolvedProblem, setTopicGoals };
