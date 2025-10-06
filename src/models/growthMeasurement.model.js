const mongoose = require('mongoose');

const growthMeasurementSchema = new mongoose.Schema({
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
  height: {
    type: Number,
    required: true,
    min: 0
  },
  diameter: {
    type: Number,
    required: true,
    min: 0
  },
  canopySpread: {
    type: Number,
    min: 0
  },
  trunkCircumference: {
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    default: ''
  },
  images: [{
    type: String,
    default: []
  }],
  measuredBy: {
    type: String,
    enum: ['user', 'expert', 'automated'],
    default: 'user'
  },
  measurementMethod: {
    type: String,
    enum: ['manual', 'laser', 'tape', 'app', 'other'],
    default: 'manual'
  },
  accuracy: {
    type: Number,
    min: 0,
    max: 100,
    default: 95
  },
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
    conditions: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'foggy']
    }
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
growthMeasurementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
growthMeasurementSchema.index({ treeId: 1, date: -1 });
growthMeasurementSchema.index({ userId: 1, date: -1 });
growthMeasurementSchema.index({ date: -1 });

// Virtual for growth rate calculation
growthMeasurementSchema.virtual('growthRate').get(function() {
  // This would be calculated by comparing with previous measurements
  // Implementation would require querying previous records
  return null;
});

// Method to calculate growth rate since last measurement
growthMeasurementSchema.methods.calculateGrowthRate = async function() {
  const GrowthMeasurement = mongoose.model('GrowthMeasurement');
  
  const previousMeasurement = await GrowthMeasurement.findOne({
    treeId: this.treeId,
    date: { $lt: this.date }
  }).sort({ date: -1 });
  
  if (!previousMeasurement) {
    return {
      heightGrowthRate: 0,
      diameterGrowthRate: 0,
      daysSinceLastMeasurement: 0
    };
  }
  
  const daysDifference = Math.floor((this.date - previousMeasurement.date) / (1000 * 60 * 60 * 24));
  const heightGrowthRate = daysDifference > 0 ? (this.height - previousMeasurement.height) / daysDifference : 0;
  const diameterGrowthRate = daysDifference > 0 ? (this.diameter - previousMeasurement.diameter) / daysDifference : 0;
  
  return {
    heightGrowthRate: Math.round(heightGrowthRate * 100) / 100,
    diameterGrowthRate: Math.round(diameterGrowthRate * 1000) / 1000,
    daysSinceLastMeasurement: daysDifference
  };
};

// Static method to get growth trend for a tree
growthMeasurementSchema.statics.getGrowthTrend = async function(treeId, months = 6) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  
  const measurements = await this.find({
    treeId,
    date: { $gte: startDate }
  }).sort({ date: 1 });
  
  return measurements.map(measurement => ({
    date: measurement.date,
    height: measurement.height,
    diameter: measurement.diameter,
    canopySpread: measurement.canopySpread
  }));
};

// Static method to get growth statistics for a tree
growthMeasurementSchema.statics.getGrowthStats = async function(treeId) {
  const measurements = await this.find({ treeId }).sort({ date: 1 });
  
  if (measurements.length < 2) {
    return null;
  }
  
  const firstMeasurement = measurements[0];
  const lastMeasurement = measurements[measurements.length - 1];
  
  const totalDays = Math.floor((lastMeasurement.date - firstMeasurement.date) / (1000 * 60 * 60 * 24));
  
  const heightGrowth = lastMeasurement.height - firstMeasurement.height;
  const diameterGrowth = lastMeasurement.diameter - firstMeasurement.diameter;
  
  const avgHeightGrowthRate = totalDays > 0 ? heightGrowth / totalDays : 0;
  const avgDiameterGrowthRate = totalDays > 0 ? diameterGrowth / totalDays : 0;
  
  return {
    totalHeightGrowth: Math.round(heightGrowth * 100) / 100,
    totalDiameterGrowth: Math.round(diameterGrowth * 1000) / 1000,
    avgHeightGrowthRate: Math.round(avgHeightGrowthRate * 1000) / 1000,
    avgDiameterGrowthRate: Math.round(avgDiameterGrowthRate * 10000) / 10000,
    totalDays,
    measurementCount: measurements.length
  };
};

module.exports = mongoose.model('GrowthMeasurement', growthMeasurementSchema);
