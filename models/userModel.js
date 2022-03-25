const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name!'],
      maxlength: [50, 'A name must have maximum 50 characters!'],
      minlength: [10, 'A name must have at least 10 characters!'],
    },
    email: {
      type: String,
      required: [true, 'A user must have an email address!'],
      trim: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email!'],
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password!'],
      minlength: [8, 'A password must contain at least 8 characters!'],
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password!'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // removes the field in the query results from the schema level. Then, no need to filter when quering.
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
