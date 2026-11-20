const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    jobType: {
      type: String,
      required: [true, 'Job type is required'],
      enum: {
        values: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'],
        message: '{VALUE} is not a valid job type'
      }
    },
    skills: {
      type: [String],
      default: []
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required']
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter reference is required']
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open'
    }
  },
  {
    timestamps: true
  }
);

// Text index for search functionality (title, description, skills)
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ recruiter: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ deadline: 1 });

jobSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
