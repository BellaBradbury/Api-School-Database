'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

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

// setup express
app.use(express.json());

// async handler
function asyncHandler(cb){
  return async (req,res, next) => {
      try {
          await cb(req, res, next);
      } catch(err) {
          next(err);
      }
  }
}

// setup a friendly greeting for the root route
app.get('/', asyncHandler( async (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
}));

// READ all users
app.get('/api/users', asyncHandler( async (req, res) => {
  const users = await User.findAll();
  res.status(200).json(users);
}));

// CREATE a new user
app.post('/api/users', asyncHandler( async (req, res) => {
  const user = req.body;

  // possible validaiton errors
  const errors = [];
  if(!user.firstName){
    errors.push('Please provide a first name');
  }
  if(!user.lastName){
    errors.push('Please provide a last name');
  }
  if(!user.emailAddress){
    errors.push('Please provide an email address');
  }
  if(!user.password){
    errors.push('Please provide a password');
  } else {
    user.password = bcrypt.hashSync(user.password, 12);
  }

  // counts and displays errors
  if(errors.length > 0) {
    res.status(400).json({ errors });
  } else {
    await User.create(user);
    res.status(201).setHeader('Location', '/').end();
  }
}));

// READ all courses with connected user
app.get('/api/courses', asyncHandler( async (req, res) => {
  const courses = await Course.findAll();
  res.status(200).json(courses);
}));

// CREATE a new course
app.post('/api/courses', asyncHandler( async (req, res) => {
  const course = req.body;

  // possible validaiton errors
  const errors = [];
  if(!course.title){
    errors.push('Please provide a title');
  }
  if(!course.description){
    errors.push('Please provide a description');
  }
  if(!course.userId){
    errors.push('Please provide a user ID');
  }

  // counts and displays errors
  if(errors.length > 0) {
    res.status(400).json({ errors });
  } else {
    await Course.create(course);
    res.status(201).setHeader('Location', `/api/courses/${course.id}`).end();
  }
}));

// READ one course with connected user
app.get('/api/courses/:id', asyncHandler( async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if(course) {
    res.status(200).json(course);
  } else {
    res.status(404).json({message: "Course Not Found"});
  }
}));

// UPDATE one course 
app.put('/api/courses/:id', asyncHandler( async (req, res) => {
  const oneCourse = await Course.findByPk(req.params.id);
  if(oneCourse) {
    const course = req.body;

    // possible validaiton errors
    const errors = [];
    if(!course.title){
      errors.push('Please provide a title');
    }
    if(!course.description){
      errors.push('Please provide a description');
    }
    if(!course.userId){
      errors.push('Please provide a user ID');
    }
  
    // counts and displays errors
    if(errors.length > 0) {
      res.status(400).json({ errors });
    } else {
      await oneCourse.update(course);
      res.status(204).end();
    }
  } else {
    res.status(404).json({message: "Course Not Found"});
  }
}));

// DELETE one course
app.delete('/api/courses/:id', asyncHandler( async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  await course.destroy(course);
  res.status(204).end();
}));

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
