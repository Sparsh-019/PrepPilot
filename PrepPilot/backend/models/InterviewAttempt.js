const mongoose = require('mongoose');

const QAExchangeSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    feedback: {
      clarityScore: { type: Number, default: 0 }, // 0-10
      relevanceScore: { type: Number, default: 0 }, // 0-10
      confidenceScore: { type: Number, default: 0 }, // 0-10
      comments: { type: String, default: '' },
    },
  },
  { _id: true }
);

const InterviewAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true }, // e.g. "SDE Intern"
    type: { type: String, enum: ['Technical', 'HR', 'Behavioral'], default: 'Technical' },
    exchanges: [QAExchangeSchema],
    overallScore: { type: Number, default: 0 }, // 0-100
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

InterviewAttemptSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewAttempt', InterviewAttemptSchema);
