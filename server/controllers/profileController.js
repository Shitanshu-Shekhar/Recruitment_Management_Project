const path = require('path');
const fs = require('fs');
const Profile = require('../models/Profile');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Get current applicant's profile
// @route   GET /api/profile/me
// @access  Applicant
const getMyProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id }).populate(
      'user',
      'name email role createdAt'
    );

    if (!profile) {
      profile = await Profile.create({
        user: req.user._id,
        phone: '',
        education: '',
        skills: [],
        experience: '',
        resumeUrl: ''
      });
      profile = await profile.populate('user', 'name email role createdAt');
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update current applicant's profile
// @route   PUT /api/profile/me
// @access  Applicant
const updateMyProfile = async (req, res, next) => {
  try {
    const { phone, education, skills, experience, resumeUrl } = req.body;

    let profile = await Profile.findOne({ user: req.user._id });

    // Handle skills array formatting if string passed (e.g., comma-separated)
    let formattedSkills = skills;
    if (typeof skills === 'string') {
      formattedSkills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (education !== undefined) updateData.education = education;
    if (formattedSkills !== undefined) updateData.skills = formattedSkills;
    if (experience !== undefined) updateData.experience = experience;
    if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;

    if (!profile) {
      profile = await Profile.create({
        user: req.user._id,
        ...updateData
      });
    } else {
      profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }

    profile = await profile.populate('user', 'name email role createdAt');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload applicant resume file
// @route   POST /api/profile/resume
// @access  Applicant
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a resume file (PDF, DOC, DOCX up to 2 MB) to upload'
      });
    }

    const filename = req.file.filename;

    // Update applicant profile with latest resume filename
    await Profile.findOneAndUpdate(
      { user: req.user._id },
      { resumeUrl: filename },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeUrl: filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    next(error);
  }
};

// @desc    View applicant profile (Recruiter or Admin)
// @route   GET /api/profile/:userId
// @access  Recruiter, Admin
const getApplicantProfile = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;

    // Admin has universal access
    if (req.user.role === 'admin') {
      const profile = await Profile.findOne({ user: targetUserId }).populate(
        'user',
        'name email role isActive createdAt'
      );

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Applicant profile not found'
        });
      }

      return res.status(200).json({
        success: true,
        profile
      });
    }

    // Recruiter check (FR-PROF-3 & FR-RES-5):
    // Recruiter can view applicant profile ONLY IF the applicant has applied to one of recruiter's jobs
    if (req.user.role === 'recruiter') {
      // Find all jobs created by this recruiter
      const recruiterJobs = await Job.find({ recruiter: req.user._id }).select('_id');
      const jobIds = recruiterJobs.map((j) => j._id);

      // Check if candidate applied to any of these jobs
      const hasApplied = await Application.findOne({
        job: { $in: jobIds },
        applicant: targetUserId
      });

      if (!hasApplied) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view profiles of candidates who applied to your job postings'
        });
      }

      const profile = await Profile.findOne({ user: targetUserId }).populate(
        'user',
        'name email role isActive createdAt'
      );

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Applicant profile not found'
        });
      }

      return res.status(200).json({
        success: true,
        profile
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Securely download/view resume file (FR-RES-5)
// @route   GET /api/profile/resume-file/:filename
// @access  Authenticated (Owning Applicant, Relevant Recruiter, or Admin)
const getResumeFile = async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename); // prevent directory traversal
    const filePath = path.join(__dirname, '..', 'uploads', 'resumes', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on server'
      });
    }

    // Check authorization:
    // 1. Admin can access any file
    if (req.user.role === 'admin') {
      return res.sendFile(filePath);
    }

    // 2. Applicant can access if it belongs to their profile or application
    if (req.user.role === 'applicant') {
      const ownProfile = await Profile.findOne({ user: req.user._id, resumeUrl: filename });
      const ownApp = await Application.findOne({ applicant: req.user._id, resumeUrl: filename });

      if (ownProfile || ownApp) {
        return res.sendFile(filePath);
      }
    }

    // 3. Recruiter can access if it was submitted to one of their jobs
    if (req.user.role === 'recruiter') {
      const recruiterJobs = await Job.find({ recruiter: req.user._id }).select('_id');
      const jobIds = recruiterJobs.map((j) => j._id);

      const matchingApp = await Application.findOne({
        job: { $in: jobIds },
        resumeUrl: filename
      });

      if (matchingApp) {
        return res.sendFile(filePath);
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: You do not have permission to view this resume'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  getApplicantProfile,
  getResumeFile
};
