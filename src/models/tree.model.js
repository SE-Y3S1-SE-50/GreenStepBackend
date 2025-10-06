const mongoose = require('mongoose');

const treeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  species: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  plantDate: {
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
  healthStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  lastWatered: {
    type: Date,
    default: Date.now
  },
  lastFertilized: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  },
  carbonAbsorbed: {
    type: Number,
    default: 0,
    min: 0
  },
  imageUrl: {
    type: String,
    default: ''
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
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
treeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
treeSchema.index({ userId: 1, createdAt: -1 });
treeSchema.index({ species: 1 });
treeSchema.index({ healthStatus: 1 });
treeSchema.index({ plantDate: 1 });
treeSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 }); // Geospatial index on coordinates

// Virtual for tree age in days
treeSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const plantDate = new Date(this.plantDate);
  return Math.floor((now - plantDate) / (1000 * 60 * 60 * 24));
});

// Method to calculate carbon absorption
treeSchema.methods.calculateCarbonAbsorption = function() {
  const ageInYears = this.ageInDays / 365;
  const baseRate = 10; // kg CO2 per year
  
  // Species-specific multipliers
  const speciesMultipliers = {
    'Quercus robur': 1.5, // Oak
    'Acer saccharum': 1.2, // Maple
    'Pinus strobus': 1.8, // Pine
    'Betula pendula': 1.0, // Birch
    'Fraxinus excelsior': 1.3, // Ash
    'Picea abies': 1.6, // Spruce
    'Tilia cordata': 1.1, // Lime
    'Carpinus betulus': 1.0, // Hornbeam
  };
  
  const speciesMultiplier = speciesMultipliers[this.species] || 1.0;
  const sizeMultiplier = Math.min(this.height / 10, 1); // Larger trees absorb more
  
  return baseRate * speciesMultiplier * sizeMultiplier * ageInYears;
};

// Method to update health status based on care records
treeSchema.methods.updateHealthStatus = async function() {
  const CareRecord = mongoose.model('CareRecord');
  const recentCareRecords = await CareRecord.find({
    treeId: this._id,
    date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  }).sort({ date: -1 }).limit(5);
  
  if (recentCareRecords.length === 0) {
    this.healthStatus = 'fair';
    return;
  }
  
  const avgHealthRating = recentCareRecords.reduce((sum, record) => sum + record.healthRating, 0) / recentCareRecords.length;
  
  if (avgHealthRating >= 4.5) {
    this.healthStatus = 'excellent';
  } else if (avgHealthRating >= 3.5) {
    this.healthStatus = 'good';
  } else if (avgHealthRating >= 2.5) {
    this.healthStatus = 'fair';
  } else {
    this.healthStatus = 'poor';
  }
};

module.exports = mongoose.model('Tree', treeSchema);
