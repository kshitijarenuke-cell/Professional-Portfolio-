const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  projectView: {
    type: String,
    enum: ['grid', 'list'],
    default: 'grid'
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
