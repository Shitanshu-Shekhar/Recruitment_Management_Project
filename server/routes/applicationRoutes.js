const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  applyToJob,
  getMyApplications,
  withdrawApplication,
  getJobApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');

const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const statusValidation = [
  body('status')
    .isIn(['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected'])
    .withMessage('Valid status is required (Applied, Under Review, Shortlisted, Selected, Rejected)')
];

// Applicant routes (note: /mine before /:id)
router.get('/mine', protect, authorizeRoles('applicant'), getMyApplications);
router.post('/:jobId', protect, authorizeRoles('applicant'), applyToJob);
router.delete('/:id', protect, authorizeRoles('applicant'), withdrawApplication);

// Recruiter routes
router.get('/job/:jobId', protect, authorizeRoles('recruiter', 'admin'), getJobApplications);
router.patch('/:id/status', protect, authorizeRoles('recruiter', 'admin'), validate(statusValidation), updateApplicationStatus);

module.exports = router;
