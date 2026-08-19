const mongoose = require('mongoose');

const techStackSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Frontend', 'Backend', 'Database', 'Languages', 'Tools', 'Deployment'],
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Technology name is required'],
    trim: true
  },
  icon: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('TechStack', techStackSchema);
