const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size exceeds maximum allowed limit of 2 MB';
  }

  // Multer generic error or invalid file type from fileFilter
  if (err.name === 'MulterError') {
    statusCode = 400;
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const key = Object.keys(err.keyValue || {})[0];
    if (key === 'email') {
      message = 'An account with this email address already exists';
    } else if (key === 'job' && err.keyValue?.applicant) {
      message = 'You have already applied for this job position';
    } else {
      message = `Duplicate value entered for ${key || 'field'}`;
    }
  }

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id: ${err.value}`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Set explicit status if err has it
  if (err.statusCode) {
    statusCode = err.statusCode;
  }

  console.error(`[Error]: ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && statusCode === 500
      ? { stack: err.stack }
      : {})
  });
};

module.exports = errorHandler;
