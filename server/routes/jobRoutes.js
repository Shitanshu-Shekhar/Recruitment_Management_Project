const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs
} = require('../controllers/jobController');

const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const jobValidation = [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('description').trim().notEmpty().withMessage('Job description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('jobType')
    .isIn(['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'])
    .withMessage('Valid job type is required (Full-time, Part-time, Internship, Contract, Remote)'),
  body('deadline').isISO8601().toDate().withMessage('Valid deadline date is required')
];

// Note: /mine must come before /:id so it's not treated as an ID param!
router.get('/', protect, getJobs);
router.get('/mine', protect, authorizeRoles('recruiter'), getMyJobs);
router.get('/:id', protect, getJobById);

router.post('/', protect, authorizeRoles('recruiter'), validate(jobValidation), createJob);
router.put('/:id', protect, authorizeRoles('recruiter'), updateJob);
router.delete('/:id', protect, authorizeRoles('recruiter', 'admin'), deleteJob);

module.exports = router;
