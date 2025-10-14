const mongoose = require('mongoose');

const educationalContentSchema = new mongoose.Schema({
  contentId: {
    type: String,
    required: true,
    unique: true
  },
  sectionId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
educationalContentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
educationalContentSchema.index({ contentId: 1 });
educationalContentSchema.index({ sectionId: 1, order: 1 });

module.exports = mongoose.model('EducationalContent', educationalContentSchema);
