const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name!'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must have less or equal than 40 characters!',
      ],
      minlength: [
        10,
        'A tour name must have more or equal than 10 characters!',
      ],
      // validate: [validator.isAlpha, 'Tour name must only contain characters!'],
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration!'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size!'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty!'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium or difficult!',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0!'],
      max: [5, 'Rating must be below 5.0!'],
      set: (value) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price!'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        // val is the priceDiscount value
        validator: function (val) {
          // "this" only points to current doc on NEW DOCUMENT CREATION! Not going to work on UPDATE!
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price!',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary!'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image!'],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // removes the field in the query results from the schema level. Then, no need to filter when quering.
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// tourSchema.index({ price: 1 }); // 1- sorting in ascending, -1 - sorting in descending
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// VIRTUAL PROPERTIES
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtually populating tour schema with tour reviews. Also you have to add populate method in the query in the handler function.
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// MIDDLEWARES
// There are 4 types of middleware in mongoose,
// 1. Document - Can act only on currently processing document
// 2. Query
// 3. Aggregation
// 4. Model

// 1. Document Middleware
// pre - a DOCUMENT MIDDLEWARE. This save middleware runs before .save() and .create() only! not works for update()!
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// post middleware. This has the saved document as a parameter (doc).
// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

// 2. Query Middleware
// this - refers to a query object. So we can chain all of the methods that we have for queries.
// tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

tourSchema.post(/^find/, (docs, next) => {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  // console.log(docs);
  next();
});

// 3. Aggregation Middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
