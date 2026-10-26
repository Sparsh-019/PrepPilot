const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      validate: (v) => Array.isArray(v) && v.length >= 2,
      required: true,
    },
    correctIndex: { type: Number, required: true },
    explanation: { type: String, default: '' },
  },
  { _id: true }
);

const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, enum: ['Aptitude', 'Technical', 'Verbal', 'DSA'], required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    durationMinutes: { type: Number, default: 15 },
    questions: [QuestionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', QuizSchema);
