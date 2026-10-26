const mongoose = require('mongoose');

const QuizResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [{ type: Number }], // index chosen per question, -1 if skipped
    score: { type: Number, required: true }, // percentage 0-100
    correctCount: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    timeTakenSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

QuizResultSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('QuizResult', QuizResultSchema);
