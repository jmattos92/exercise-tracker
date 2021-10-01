const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  exercises: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: false,
    }
  ]
})

const User = mongoose.model('User', userSchema);

module.exports = User;