const Application = require('../models/Application');
const Job = require('../models/Job');
const Profile = require('../models/Profile');

// @desc    Apply to a job
// @route   POST /api/applications/:jobId
// @access  Applicant
const applyToJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, resumeUrl } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Check if job is expired or closed (FR-JOB-6)
    const isExpired = new Date(job.deadline) < new Date();
    if (job.status === 'Closed' || isExpired) {
      return res.status(400).json({
        success: false,
        message: 'This job posting is closed or its application deadline has passed'
      });
    }

    // Check for duplicate application (FR-APP-2)
    const existing = await Application.findOne({
      job: jobId,
      applicant: req.user._id
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this job position'
      });
    }

    // Determine resume URL (from request body or from profile)
    let candidateResume = resumeUrl;
    if (!candidateResume) {
      const profile = await Profile.findOne({ user: req.user._id });
      if (profile && profile.resumeUrl) {
        candidateResume = profile.resumeUrl;
      }
    }

    if (!candidateResume) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume in your profile or provide one before applying'
      });
    }

    const application = await Application.create({
      job: jobId,
      applicant: req.user._id,
      resumeUrl: candidateResume,
      coverLetter: coverLetter ? coverLetter.trim() : '',
      status: 'Applied',
      appliedAt: new Date()
    });

    const populatedApp = await Application.findById(application._id).populate({
      path: 'job',
      select: 'title location jobType recruiter status',
      populate: { path: 'recruiter', select: 'name email' }
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application: populatedApp
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current applicant's applications
// @route   GET /api/applications/mine
// @access  Applicant
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'job',
        select: 'title location jobType status deadline recruiter',
        populate: { path: 'recruiter', select: 'name email' }
      })
      .sort({ appliedAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw application (only while status is 'Applied')
// @route   DELETE /api/applications/:id
// @access  Applicant (Owner)
const withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Ownership check
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot withdraw another candidate’s application'
      });
    }

    // FR-APP-6: Can only withdraw while status is Applied
    if (application.status !== 'Applied') {
      return res.status(400).json({
        success: false,
        message: `Cannot withdraw application once it has progressed to status '${application.status}'`
      });
    }

    await Application.findByIdAndDelete(application._id);

    return res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Recruiter (Owner of the job)
const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found'
      });
    }

    // Check ownership
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view applications for your own job postings'
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate('applicant', 'name email role createdAt')
      .sort({ appliedAt: -1 })
      .lean();

    // Attach candidate profile details to each application
    const applicationsWithProfiles = await Promise.all(
      applications.map(async (app) => {
        if (!app.applicant) return app;
        const profile = await Profile.findOne({ user: app.applicant._id }).lean();
        return {
          ...app,
          profile: profile || null
        };
      })
    );

    return res.status(200).json({
      success: true,
      jobTitle: job.title,
      count: applicationsWithProfiles.length,
      applications: applicationsWithProfiles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Recruiter (Owner of the job)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const application = await Application.findById(req.params.id).populate('job');
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Ownership check: recruiter must own the job
    if (
      application.job.recruiter.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to update applications for this job'
      });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({
      success: true,
      message: `Application status updated to '${status}'`,
      application
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  withdrawApplication,
  getJobApplications,
  updateApplicationStatus
};
