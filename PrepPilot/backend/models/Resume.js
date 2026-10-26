const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    rawText: { type: String, required: true },
    targetRole: { type: String, default: '' },
    analysis: {
      atsScore: { type: Number, default: 0 }, // 0-100
      passLikelihood: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
      missingKeywords: [{ type: String }],
      matchedKeywords: [{ type: String }],
      strengths: [{ type: String }],
      improvements: [{ type: String }],
      summary: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

ResumeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', ResumeSchema);
