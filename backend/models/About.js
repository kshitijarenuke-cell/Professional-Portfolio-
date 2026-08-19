const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  stats: [
    {
      label: { type: String, required: true },
      value: { type: String, required: true }
    }
  ],
  resumeUrl: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('About', aboutSchema);
