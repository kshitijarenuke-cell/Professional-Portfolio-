const mongoose = require('mongoose');

const credentialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    issuer: {
      type: String,
      required: [true, 'Issuer is required'],
      trim: true
    },
    date: {
      type: String,
      default: '',
      trim: true
    },
    category: {
      type: String,
      enum: ['certification', 'award', 'hackathon'],
      default: 'certification'
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    skills: [
      {
        type: String,
        trim: true
      }
    ],
    credentialId: {
      type: String,
      default: '',
      trim: true
    },
    verifyUrl: {
      type: String,
      default: '',
      trim: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Credential', credentialSchema);
