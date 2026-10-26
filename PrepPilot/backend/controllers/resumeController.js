const asyncHandler = require('express-async-handler');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const { analyzeResume } = require('../services/aiService');

// @desc    Upload a resume (PDF or plain text) and run ATS analysis
// @route   POST /api/resume/analyze
// @access  Private
// @note    Uses multer memory storage (see routes/resumeRoutes.js) so req.file.buffer holds the bytes
const analyzeUploadedResume = asyncHandler(async (req, res) => {
  const { targetRole } = req.body;

  if (!req.file && !req.body.rawText) {
    res.status(400);
    throw new Error('Upload a resume file (PDF) or provide rawText in the request body');
  }

  let rawText = req.body.rawText || '';
  let fileName = 'pasted-text.txt';

  if (req.file) {
    fileName = req.file.originalname;
    if (req.file.mimetype === 'application/pdf') {
      const parsed = await pdfParse(req.file.buffer);
      rawText = parsed.text;
    } else {
      rawText = req.file.buffer.toString('utf-8');
    }
  }

  if (!rawText || rawText.trim().length < 30) {
    res.status(400);
    throw new Error('Could not extract meaningful text from the resume — file may be empty, scanned, or corrupted');
  }

  const analysis = await analyzeResume(rawText, targetRole || req.user.targetRole || 'Default');

  const resume = await Resume.create({
    user: req.user._id,
    fileName,
    rawText,
    targetRole: targetRole || req.user.targetRole || 'Default',
    analysis,
  });

  // Blend resume ATS score into the user's overall readiness score
  req.user.readinessScore = Math.round(req.user.readinessScore * 0.7 + analysis.atsScore * 0.3);
  await req.user.save();

  res.status(201).json({ success: true, resume });
});

// @desc    Get current user's resume analysis history
// @route   GET /api/resume/history
// @access  Private
const getResumeHistory = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id })
    .select('-rawText')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({ success: true, resumes });
});

// @desc    Get a single resume analysis by id
// @route   GET /api/resume/:id
// @access  Private
const getResumeById = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    res.status(404);
    throw new Error('Resume analysis not found');
  }
  res.json({ success: true, resume });
});

module.exports = { analyzeUploadedResume, getResumeHistory, getResumeById };
