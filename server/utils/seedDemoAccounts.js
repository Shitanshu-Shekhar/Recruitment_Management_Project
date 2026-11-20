const User = require('../models/User');
const Profile = require('../models/Profile');

const demoAccounts = [
  {
    name: 'Aarav Sharma',
    email: 'applicant@example.com',
    password: 'Applicant@123',
    role: 'applicant'
  },
  {
    name: 'Vikram Malhotra',
    email: 'recruiter@example.com',
    password: 'Recruiter@123',
    role: 'recruiter'
  },
  {
    name: 'Rajesh Verma',
    email: 'admin@example.com',
    password: 'Admin@123456',
    role: 'admin'
  }
];

const seedDemoAccounts = async () => {
  for (const account of demoAccounts) {
    const passwordHash = await User.hashPassword(account.password);
    const user = await User.findOneAndUpdate(
      { email: account.email },
      {
        $set: {
          name: account.name,
          passwordHash,
          role: account.role,
          isActive: true
        },
        $setOnInsert: { email: account.email }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (account.role === 'applicant') {
      await Profile.findOneAndUpdate(
        { user: user._id },
        {
          $setOnInsert: {
            user: user._id,
            phone: '',
            education: '',
            skills: [],
            experience: '',
            resumeUrl: ''
          }
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
  }

  console.log('[Demo Seed] Ensured the three demo accounts and applicant profile.');
};

module.exports = seedDemoAccounts;
