const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
  description: String,
  duration: Number,
  date: String,
  originalDate: { 
    type: Date,
    required: false
  },
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

module.exports = Exercise;