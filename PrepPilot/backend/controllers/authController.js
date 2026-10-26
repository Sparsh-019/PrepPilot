const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const DSAProgress = require('../models/DSAProgress');
const generateToken = require('../utils/generateToken');

// @desc    Register a new student/user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, college, branch, graduationYear, targetRole } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    college,
    branch,
    graduationYear,
    targetRole,
  });

  // Initialize an empty DSA progress document for the new user
  await DSAProgress.create({ user: user._id, solvedProblems: [] });

  res.status(201).json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id, user.role),
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    user: user.toSafeObject(),
    token: generateToken(user._id, user.role),
  });
});

// @desc    Get current logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

// @desc    Update current user's profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'college', 'branch', 'graduationYear', 'targetRole', 'skills', 'avatarUrl'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  await req.user.save();
  res.json({ success: true, user: req.user.toSafeObject() });
});

module.exports = { registerUser, loginUser, getMe, updateMe };
