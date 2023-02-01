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
  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    emailAddress: req.body.emailAddress,
    password: req.body.password
  });
  res.status(201).setHeader('Location', '/').end();
}));

// READ all courses with connected user
app.get('/api/courses', asyncHandler( async (req, res) => {
  const courses = await Course.findAll();
  res.status(200).json(courses);
}));

// CREATE a new course
app.post('/api/courses', asyncHandler( async (req, res) => {
  const course = await Course.create({
    title: req.body.title,
    description: req.body.description,
    estimatedTime: req.body.estimatedTime,
    materialsNeeded: req.body.materialsNeeded,
    userId: req.body.userId
  });
  res.status(201).setHeader('Location', `/api/courses/${res.param.id}`).end();
}));

// READ one course with connected user
app.get('/api/courses/:id', asyncHandler( async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  res.json(course);
}));

// UPDATE one course 
app.put('/api/courses/:id', asyncHandler( async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    if(course) {
      course.title = req.body.title;
      course.description = req.body.description;
      course.estimatedTime = req.body.estimatedTime;
      course.materialsNeeded = req.body.materialsNeeded;
      course.userId = req.body.userId;

      await Course.update(course);
      res.status(204);
    } else {
      res.status(404).json({message: "Course Not Found"});
    }
  res.json(course);
}));

// DELETE one course
app.delete('/api/courses/:id', asyncHandler( async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  res.json(course);
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
