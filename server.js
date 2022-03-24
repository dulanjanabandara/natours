const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handling uncaught exceptions
// All errors occured on synchronous code and not handled are called, uncaught exceptions.
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception..! Shutting down...');
  console.log(err.name, err.message);

  // Really really need to crash the application as after the uncaught exception, the applications is in unclean state!
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

// console.log(app.get("env"));
// console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successfully established...');
  });
// Below catch block was added to unhandled promise rejection handle. But I've implemented a global way to handle promise rejections. That's why below line is commented!
// .catch((err) => console.log('ERROR'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handling unhandled promise rejections
// subscribing to unhandled rejection event emitted by the process object using .on() method. Basically we're listening to an event!
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection..! Shutting down...');
  server.close(() => {
    // Crashing the application
    // Here crashing is optional is unhandled rejection.
    process.exit(1);
  });
});
