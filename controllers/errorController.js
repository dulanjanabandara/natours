/* eslint-disable no-lonely-if */
const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400); // 400 - bad request
};

const handleDupicateFieldsDB = (err) => {
  // const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  // console.log(value);
  // const message = `Duplicate field value: ${value}. Please use another value!`;

  const message = `Duplicate field value: "${err.keyValue.name}". Please use another value!`;
  return new AppError(message, 404);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token! Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again!', 401);

const sendErrorDev = (err, req, res) => {
  // A) API
  // originalUrl - entire url without host
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // B) RENDERED WEBSITE
  console.error('ERROR: ', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // a) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // b) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR: ', err);

    // 2) Send the generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // B) RENDERED WEBSITE
  // a) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Sonething went wrong!',
      msg: err.message,
    });
  }
  // b) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR: ', err);

  // 2) Send the generic message
  return res.status(500).render({
    title: 'Something went wrong!',
    msg: 'Please try again later!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; // 500 means internal server error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDupicateFieldsDB(error);
    if (error._message === 'Validation failed')
      error = handleValidationErrorDB(error);
    // This was the original version of above operation. But I had to change as error.name gave "undefined".
    // if (error.name === 'ValidationError')
    //   error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    // console.log(err.message);
    // console.log(error.message);
    sendErrorProd(error, req, res);
  }
};
