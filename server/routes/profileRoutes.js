const express = require('express');
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  getApplicantProfile,
  getResumeFile
} = require('../controllers/profileController');

const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const upload = require('../middleware/upload');

// Applicant profile routes
router.get('/me', protect, authorizeRoles('applicant'), getMyProfile);
router.put('/me', protect, authorizeRoles('applicant'), updateMyProfile);
router.post('/resume', protect, authorizeRoles('applicant'), upload.single('resume'), uploadResume);

// Secure resume file serving route (protected and authorized)
router.get('/resume-file/:filename', protect, getResumeFile);

// Recruiter / Admin view applicant profile
router.get('/:userId', protect, authorizeRoles('recruiter', 'admin'), getApplicantProfile);

module.exports = router;
