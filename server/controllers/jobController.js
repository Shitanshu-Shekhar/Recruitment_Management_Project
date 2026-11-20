const Job = require('../models/Job');
const Application = require('../models/Application');

// Helper to auto-close expired jobs
const checkJobExpiry = async (job) => {
  if (job && job.status === 'Open' && new Date(job.deadline) < new Date()) {
    job.status = 'Closed';
    await job.save();
  }
  return job;
};

// @desc    Get all jobs (public/applicant) with pagination, search, filter
// @route   GET /api/jobs
// @access  Authenticated
const getJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { q, location, jobType, status } = req.query;

    const query = {};

    // Search by keyword in title, description, or skills
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { skills: { $in: [searchRegex] } },
        { location: searchRegex }
      ];
    }

    // Filter by location
    if (location && location.trim()) {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Filter by jobType
    if (jobType && jobType.trim() && jobType !== 'All') {
      query.jobType = jobType.trim();
    }

    // Filter by status (Open / Closed)
    if (status && status.trim() && status !== 'All') {
      query.status = status.trim();
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Check expiry for jobs on-the-fly
    const now = new Date();
    const updatedJobs = jobs.map((job) => {
      const isExpired = new Date(job.deadline) < now;
      return {
        ...job,
        status: isExpired ? 'Closed' : job.status,
        isExpired
      };
    });

    return res.status(200).json({
      success: true,
      count: updatedJobs.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      jobs: updatedJobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Authenticated
const getJobById = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id).populate('recruiter', 'name email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Auto-update if past deadline
    if (job.status === 'Open' && new Date(job.deadline) < new Date()) {
      job.status = 'Closed';
      await job.save();
    }

    // Check if current user has already applied (if applicant)
    let hasApplied = false;
    let existingApplication = null;
    if (req.user && req.user.role === 'applicant') {
      existingApplication = await Application.findOne({
        job: job._id,
        applicant: req.user._id
      });
      hasApplied = !!existingApplication;
    }

    return res.status(200).json({
      success: true,
      job: {
        ...job.toJSON(),
        hasApplied,
        applicationId: existingApplication?._id,
        applicationStatus: existingApplication?.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new job posting
// @route   POST /api/jobs
// @access  Recruiter
const createJob = async (req, res, next) => {
  try {
    const { title, description, location, jobType, skills, deadline, status } = req.body;

    // Format skills
    let formattedSkills = skills;
    if (typeof skills === 'string') {
      formattedSkills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const job = await Job.create({
      title: title.trim(),
      description,
      location: location.trim(),
      jobType,
      skills: formattedSkills || [],
      deadline: new Date(deadline),
      recruiter: req.user._id,
      status: status || 'Open'
    });

    return res.status(201).json({
      success: true,
      message: 'Job posting created successfully',
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing job posting
// @route   PUT /api/jobs/:id
// @access  Recruiter (Owner only)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Ownership check (FR-JOB-2)
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this job posting'
      });
    }

    const { title, description, location, jobType, skills, deadline, status } = req.body;

    if (title) job.title = title.trim();
    if (description) job.description = description;
    if (location) job.location = location.trim();
    if (jobType) job.jobType = jobType;
    if (deadline) job.deadline = new Date(deadline);
    if (status) job.status = status;

    if (skills !== undefined) {
      job.skills = typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : skills;
    }

    // If deadline is set in the future and status was Closed, allow opening
    await job.save();

    return res.status(200).json({
      success: true,
      message: 'Job posting updated successfully',
      job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Recruiter (Owner), Admin
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Authorization check: Recruiter owner or Admin
    const isOwner = job.recruiter.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this job posting'
      });
    }

    // Delete associated applications
    await Application.deleteMany({ job: job._id });

    // Delete job
    await Job.findByIdAndDelete(job._id);

    return res.status(200).json({
      success: true,
      message: 'Job and all associated applications deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recruiter's own jobs with applicant counts
// @route   GET /api/jobs/mine
// @access  Recruiter
const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    // Aggregate applicant counts for each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        const isExpired = new Date(job.deadline) < now;
        return {
          ...job,
          applicantCount,
          status: isExpired ? 'Closed' : job.status,
          isExpired
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

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs
};
