const express = require('express');
const multer = require('multer');
const {
  analyzeUploadedResume,
  getResumeHistory,
  getResumeById,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// In-memory storage: files never touch disk, kept small, then discarded after parsing.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'text/plain'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF or plain text resumes are supported'));
  },
});

router.use(protect);

router.post('/analyze', upload.single('resume'), analyzeUploadedResume);
router.get('/history', getResumeHistory);
router.get('/:id', getResumeById);

module.exports = router;
