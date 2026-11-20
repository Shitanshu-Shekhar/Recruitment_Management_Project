const express = require('express');
const router = express.Router();

const {
  getStats,
  getUsers,
  toggleUserActive,
  deleteUser,
  getAllJobs,
  getAllApplications
} = require('../controllers/adminController');

const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/role');

// All admin routes require authentication and admin role
router.use(protect, authorizeRoles('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/active', toggleUserActive);
router.delete('/users/:id', deleteUser);
router.get('/jobs', getAllJobs);
router.get('/applications', getAllApplications);

module.exports = router;
