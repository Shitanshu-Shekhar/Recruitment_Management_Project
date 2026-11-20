const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Profile = require('../models/Profile');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalApplicants = await User.countDocuments({ role: 'applicant' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'Open', deadline: { $gte: new Date() } });
    const closedJobs = totalJobs - openJobs;

    const totalApplications = await Application.countDocuments();

    // Group applications by status
    const statusCounts = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusMap = {
      Applied: 0,
      'Under Review': 0,
      Shortlisted: 0,
      Selected: 0,
      Rejected: 0
    };

    statusCounts.forEach((item) => {
      if (item._id) {
        statusMap[item._id] = item.count;
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalApplicants,
        totalRecruiters,
        totalAdmins,
        totalJobs,
        openJobs,
        closedJobs,
        totalApplications,
        statusBreakdown: statusMap
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all users with filters and search
// @route   GET /api/admin/users
// @access  Admin
const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    const { role, q } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate or deactivate user
// @route   PATCH /api/admin/users/:id/active
// @access  Admin
const toggleUserActive = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account'
      });
    }

    // Allow setting explicitly via body or toggling
    if (req.body.isActive !== undefined) {
      user.isActive = Boolean(req.body.isActive);
    } else {
      user.isActive = !user.isActive;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User '${user.name}' has been ${user.isActive ? 'activated' : 'deactivated'}`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrative account'
      });
    }

    // Cascade delete user data
    await Profile.deleteOne({ user: user._id });
    await Application.deleteMany({ applicant: user._id });

    // If recruiter, delete jobs and applications to those jobs
    if (user.role === 'recruiter') {
      const recruiterJobs = await Job.find({ recruiter: user._id });
      const jobIds = recruiterJobs.map((j) => j._id);
      await Application.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ recruiter: user._id });
    }

    await User.findByIdAndDelete(user._id);

    return res.status(200).json({
      success: true,
      message: `User '${user.name}' and all associated records deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all jobs across platform
// @route   GET /api/admin/jobs
// @access  Admin
const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return {
          ...job,
          applicantCount
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: jobsWithCounts.length,
      jobs: jobsWithCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List all applications across platform
// @route   GET /api/admin/applications
// @access  Admin
const getAllApplications = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('applicant', 'name email')
      .populate({
        path: 'job',
        select: 'title location jobType recruiter status',
        populate: { path: 'recruiter', select: 'name email' }
      })
      .sort({ appliedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUsers,
  toggleUserActive,
  deleteUser,
  getAllJobs,
  getAllApplications
};
