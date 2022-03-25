const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name!'],
      maxlength: [50, 'A name must have maximum 50 characters!'],
      // minlength: [10, 'A name must have at least 10 characters!'],
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
      validate: {
        // This only works on CREATE and SAVE!!! Not going to work on UPDATE!!!
        validator: function (el) {
          // el is current element which is passwordConfirm
          return el === this.password;
        },
        message: 'Passwords do not match!',
      },
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

userSchema.pre('save', async function (next) {
  // Only run if the password is actually modified.
  //this - refers to the current document.
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete the password confirm field
  this.passwordConfirm = undefined; // undefining is the way of deleting not persisted data fields in the database.
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
