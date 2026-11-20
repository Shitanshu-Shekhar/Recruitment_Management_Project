const multer = require('multer');
const path = require('path');

// File filter: accept only PDF, DOC, DOCX
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream' // sometimes sent by some clients for docx
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  if (allowedExtensions.includes(ext) && (allowedMimeTypes.includes(mime) || ext === '.docx' || ext === '.doc')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are permitted.'), false);
  }
};

// Maximum file size: 2 MB (2 * 1024 * 1024 bytes)
const upload = multer({
  // Keep the small, size-limited file in memory until the controller writes it
  // to MongoDB GridFS. Render's service filesystem is ephemeral.
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: fileFilter
});

module.exports = upload;
