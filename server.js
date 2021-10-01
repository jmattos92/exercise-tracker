require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/user');
const Exercise = require('./models/exercise');

const isValid = (date) => {
  return !isNaN(date) && date instanceof Date;
};

const app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/api/users', (req, res) => {
  const users = User.find()
  .then(users => {
    res.json(users);
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id: userId } = req.params;
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);
  const limit = parseInt(req.query.limit);
  const foundUser = User.findOne({ _id: userId })
  .populate('exercises')
  .then(foundUser => {
    let listOfExercises = foundUser.exercises;
    if (isValid(from) && isValid(to)) {
      listOfExercises = foundUser.exercises.filter((exercise) => exercise.originalDate >= from && exercise.originalDate <= to);
    } 
    if (!isNaN(limit) && listOfExercises.length > limit) {
      listOfExercises.splice(0, limit);
    }
    res.json({
      _id: userId,
      username: foundUser.username,
      count: listOfExercises.length,
      log: listOfExercises,
    });
  })
})

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const newUser = new User({
    username
  })
  .save()
  .then(newUser => {
    console.log(`User ${newUser.username} successfully created`);
    res.json(newUser);
  })
  .catch(e => {
    console.log(e);
  })
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id: userId } = req.params;
  const { description, duration, date } = req.body;

  const newExercise = new Exercise({
    duration,
    description,
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
    originalDate: date ? new Date(date) : new Date()
  })
  .save()
  .then(newExercise => {
    User.findOne({ _id: userId })
      .populate('exercises')
      .then(foundUser => {
        foundUser.exercises.push(newExercise);
        foundUser.save()
        .then(foundUser => {
          console.log(`Exercise ${newExercise.description} successfully created`);
          res.json({
            _id: foundUser._id,
            username: foundUser.username,
            description: newExercise.description,
            duration: newExercise.duration,
            date: newExercise.date,
          });
        })
      });
  })
})

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
})
