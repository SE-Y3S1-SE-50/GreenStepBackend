const mongoose = require('mongoose');

const careRecordSchema = new mongoose.Schema({
  treeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tree',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  action: {
    type: String,
    enum: ['watering', 'fertilizing', 'pruning', 'pest_control', 'other'],
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  healthRating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  images: [{
    type: String,
    default: []
  }],
  weather: {
    temperature: {
      type: Number,
      min: -50,
      max: 60
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100
    },
    precipitation: {
      type: Number,
      min: 0
    },
    conditions: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'foggy']
    }
  },
  duration: {
    type: Number, // in minutes
    min: 0
  },
  materials: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['kg', 'g', 'L', 'mL', 'pieces', 'bags']
    }
  }],
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
careRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
careRecordSchema.index({ treeId: 1, date: -1 });
careRecordSchema.index({ userId: 1, date: -1 });
careRecordSchema.index({ action: 1 });
careRecordSchema.index({ date: -1 });

// Virtual for action display name
careRecordSchema.virtual('actionDisplayName').get(function() {
  const actionNames = {
    'watering': 'Watering',
    'fertilizing': 'Fertilizing',
    'pruning': 'Pruning',
    'pest_control': 'Pest Control',
    'other': 'Other Care'
  };
  return actionNames[this.action] || this.action;
});

// Method to get care frequency for a tree
careRecordSchema.statics.getCareFrequency = async function(treeId, action, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const count = await this.countDocuments({
    treeId,
    action,
    date: { $gte: startDate }
  });
  
  return count;
};

// Method to get average health rating for a tree
careRecordSchema.statics.getAverageHealthRating = async function(treeId, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const result = await this.aggregate([
    {
      $match: {
        treeId: new mongoose.Types.ObjectId(treeId),
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$healthRating' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { averageRating: 0, count: 0 };
};

module.exports = mongoose.model('CareRecord', careRecordSchema);
