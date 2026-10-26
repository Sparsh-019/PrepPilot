const mongoose = require('mongoose');

const SolvedProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    topic: {
      type: String,
      required: true,
      enum: [
        'Arrays', 'Strings', 'LinkedList', 'Stacks', 'Queues', 'Trees',
        'Graphs', 'DynamicProgramming', 'Recursion', 'Sorting', 'Searching',
        'Greedy', 'Backtracking', 'BitManipulation', 'HashMaps', 'Other',
      ],
    },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    platform: { type: String, default: 'LeetCode' },
    url: { type: String, default: '' },
    timeTakenMinutes: { type: Number, default: 0 },
    solvedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const DSAProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    solvedProblems: [SolvedProblemSchema],
    topicGoals: {
      type: Map,
      of: Number, // target number of problems per topic
      default: {},
    },
  },
  { timestamps: true }
);

// Virtual: total solved count
DSAProgressSchema.virtual('totalSolved').get(function () {
  return this.solvedProblems.length;
});

// Compute per-topic breakdown
DSAProgressSchema.methods.getTopicBreakdown = function () {
  const breakdown = {};
  for (const problem of this.solvedProblems) {
    breakdown[problem.topic] = (breakdown[problem.topic] || 0) + 1;
  }
  return breakdown;
};

// Compute a 0-100 DSA readiness score based on volume + difficulty spread
DSAProgressSchema.methods.computeScore = function () {
  const total = this.solvedProblems.length;
  if (total === 0) return 0;
  const weights = { Easy: 1, Medium: 2, Hard: 3 };
  const weightedSum = this.solvedProblems.reduce((sum, p) => sum + (weights[p.difficulty] || 1), 0);
  const maxPossible = total * 3;
  const score = Math.round((weightedSum / maxPossible) * 100);
  // Blend with volume: solving 150+ problems well-distributed should approach 100
  const volumeFactor = Math.min(total / 150, 1);
  return Math.round(score * 0.6 + volumeFactor * 100 * 0.4);
};

module.exports = mongoose.model('DSAProgress', DSAProgressSchema);
