const crypto = require('crypto');
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
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please provide a password!'],
      minlength: [8, 'A password must contain at least 8 characters!'],
      select: false,
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
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  }
  // {
  //   toJSON: { virtuals: true },
  //   toObject: { virtuals: true },
  // }
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

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // this 1s deduction always ensures that token always is created after the password has been changed. This is not 100% accurate but this is a smart hack and it makes no issues!
  next();
});

// Query Middleware for select active users
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

// Instance Method
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT CHANGED!
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // The one we send through the email.
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
