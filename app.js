'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const Sequelize = require('sequelize');

const models = require('./models');
const { Course, User } = models;

const router = express.Router();

// connect & test database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'library.db'
});
( async() => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Database connection successful!");
  } catch (err) {
    console.log("There has been a database connection error:", err);
  }
})();


// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// READ all users
app.get('/api/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// CREATE a new user

// READ all courses with connected user
app.get('/api/courses', async (req, res) => {
  const courses = await Course.findAll();
  res.json(courses);
});

// CREATE a new course

// READ one course with connected user

// UPDATE one course 

// DELETE one course


// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
