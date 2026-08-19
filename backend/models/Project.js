const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  technologies: [
    {
      type: String,
      trim: true
    }
  ],
  githubUrl: {
    type: String,
    default: '#'
  },
  liveUrl: {
    type: String,
    default: '#'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Project', projectSchema);
