const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    const isAgreementRoute = req.originalUrl && (
      req.originalUrl.includes('/virtual-offices') ||
      req.originalUrl.includes('/managed-offices') ||
      req.originalUrl.includes('/cowork-spaces') ||
      req.originalUrl.includes('/dedicated-spaces')
    );
    message = isAgreementRoute
      ? 'File size limit exceeded. Maximum allowed size is 50MB.'
      : 'File size limit exceeded. Maximum allowed size is 5MB.';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    success: false,
    message: message
  });
};

module.exports = errorMiddleware;
