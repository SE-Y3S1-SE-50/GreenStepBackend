const Tree = require('../models/tree.model');
const CareRecord = require('../models/careRecord.model');
const GrowthMeasurement = require('../models/growthMeasurement.model');
const CareReminder = require('../models/careReminder.model');
const analyticsService = require('../services/analyticsService');
const { validationResult } = require('express-validator');

// Tree Management
const getTrees = async (req, res) => {
  try {
    // Use a default user ID for development (bypassing authentication)
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4'; // Default user ID from seeded data
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const trees = await Tree.find({ userId, isActive: true })
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'firstName lastName');
    
    const total = await Tree.countDocuments({ userId, isActive: true });
    
    res.json({
      success: true,
      data: {
        trees,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTrees: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching trees',
      error: error.message
    });
  }
};

const getTreeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4'; // Default user ID
    
    const tree = await Tree.findOne({ _id: id, userId, isActive: true })
      .populate('userId', 'firstName lastName');
    
    if (!tree) {
      return res.status(404).json({
        success: false,
        message: 'Tree not found'
      });
    }
    
    // Get recent care records and growth measurements
    const [careRecords, growthMeasurements, reminders] = await Promise.all([
      CareRecord.find({ treeId: id, userId }).sort({ date: -1 }).limit(5),
      GrowthMeasurement.find({ treeId: id, userId }).sort({ date: -1 }).limit(5),
      CareReminder.find({ treeId: id, userId, isCompleted: false }).sort({ dueDate: 1 })
    ]);
    
    res.json({
      success: true,
      data: {
        tree,
        recentCareRecords: careRecords,
        recentGrowthMeasurements: growthMeasurements,
        upcomingReminders: reminders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tree',
      error: error.message
    });
  }
};

const addTree = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4'; // Default user ID
    const treeData = {
      ...req.body,
      userId,
      carbonAbsorbed: 0 // Initial carbon absorption
    };
    
    const tree = new Tree(treeData);
    await tree.save();
    
    // Create default care reminders for the new tree
    await CareReminder.createDefaultReminders(tree._id, userId);
    
    // Update carbon absorption calculation
    tree.carbonAbsorbed = tree.calculateCarbonAbsorption();
    await tree.save();
    
    res.status(201).json({
      success: true,
      message: 'Tree added successfully',
      data: tree
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding tree',
      error: error.message
    });
  }
};

const updateTree = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4';
    
    const tree = await Tree.findOne({ _id: id, userId, isActive: true });
    
    if (!tree) {
      return res.status(404).json({
        success: false,
        message: 'Tree not found'
      });
    }
    
    Object.assign(tree, req.body);
    await tree.save();
    
    res.json({
      success: true,
      message: 'Tree updated successfully',
      data: tree
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating tree',
      error: error.message
    });
  }
};

const deleteTree = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4';
    
    const tree = await Tree.findOne({ _id: id, userId, isActive: true });
    
    if (!tree) {
      return res.status(404).json({
        success: false,
        message: 'Tree not found'
      });
    }
    
    // Soft delete by setting isActive to false
    await Tree.updateOne(
      { _id: id, userId, isActive: true },
      { isActive: false }
    );
    
    // Also deactivate related care reminders
    await CareReminder.updateMany(
      { treeId: id, userId },
      { isCompleted: true }
    );
    
    res.json({
      success: true,
      message: 'Tree deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting tree',
      error: error.message
    });
  }
};

// Care Records Management
const getCareRecords = async (req, res) => {
  try {
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4';
    const { treeId, page = 1, limit = 10, action } = req.query;
    
    const filter = { userId };
    if (treeId) filter.treeId = treeId;
    if (action) filter.action = action;
    
    const careRecords = await CareRecord.find(filter)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await CareRecord.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        careRecords,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching care records',
      error: error.message
    });
  }
};

const addCareRecord = async (req, res) => {
  try {
    console.log('🔍 Backend: Received care record data:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('🔍 Backend: Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4';
    const careRecordData = {
      ...req.body,
      userId
    };
    
    console.log('🔍 Backend: Creating care record with data:', careRecordData);
    
    const careRecord = new CareRecord(careRecordData);
    await careRecord.save();
    
    console.log('🔍 Backend: Care record created successfully:', careRecord._id);
    
    // Update tree's health status based on new care record
    const tree = await Tree.findById(careRecord.treeId);
    if (tree) {
      await tree.updateHealthStatus();
      await tree.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Care record added successfully',
      data: careRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding care record',
      error: error.message
    });
  }
};

const updateCareRecord = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4';
    
    const careRecord = await CareRecord.findOne({ _id: id, userId });
    
    if (!careRecord) {
      return res.status(404).json({
        success: false,
        message: 'Care record not found'
      });
    }
    
    Object.assign(careRecord, req.body);
    await careRecord.save();
    
    // Update tree's health status
    const tree = await Tree.findById(careRecord.treeId);
    if (tree) {
      await tree.updateHealthStatus();
      await tree.save();
    }
    
    res.json({
      success: true,
      message: 'Care record updated successfully',
      data: careRecord
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating care record',
      error: error.message
    });
  }
};

// Growth Measurements
const addGrowthMeasurement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4';
    const measurementData = {
      ...req.body,
      userId
    };
    
    const measurement = new GrowthMeasurement(measurementData);
    await measurement.save();
    
    // Update tree's height and diameter
    const tree = await Tree.findById(measurement.treeId);
    if (tree) {
      tree.height = measurement.height;
      tree.diameter = measurement.diameter;
      tree.carbonAbsorbed = tree.calculateCarbonAbsorption();
      await tree.save();
    }
    
    res.status(201).json({
      success: true,
      message: 'Growth measurement added successfully',
      data: measurement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding growth measurement',
      error: error.message
    });
  }
};

const getGrowthMeasurements = async (req, res) => {
  try {
    const { treeId } = req.params;
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4';
    
    const measurements = await GrowthMeasurement.find({ treeId, userId })
      .sort({ date: -1 })
      .populate('treeId', 'name species');
    
    res.json({
      success: true,
      data: measurements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching growth measurements',
      error: error.message
    });
  }
};

// Care Reminders
const getCareReminders = async (req, res) => {
  try {
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4';
    const { type, isCompleted, overdue } = req.query;
    
    let filter = { userId };
    if (type) filter.type = type;
    if (isCompleted !== undefined) filter.isCompleted = isCompleted === 'true';
    
    if (overdue === 'true') {
      filter.dueDate = { $lt: new Date() };
      filter.isCompleted = false;
    }
    
    const reminders = await CareReminder.find(filter)
      .sort({ dueDate: 1 })
      .populate('treeId', 'name species location');
    
    res.json({
      success: true,
      data: reminders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching care reminders',
      error: error.message
    });
  }
};

const markReminderCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4';
    
    const reminder = await CareReminder.findOne({ _id: id, userId });
    
    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }
    
    reminder.markCompleted();
    await reminder.save();
    
    res.json({
      success: true,
      message: 'Reminder marked as completed',
      data: reminder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking reminder as completed',
      error: error.message
    });
  }
};

// Analytics
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4';
    const stats = await analyticsService.getDashboardStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

const getAnalyticsReport = async (req, res) => {
  try {
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4';
    const { period = '6months' } = req.query;
    
    const report = await analyticsService.generateAnalyticsReport(userId, period);
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating analytics report',
      error: error.message
    });
  }
};

const getGrowthTrend = async (req, res) => {
  try {
    const userId = req.user?.id || '68e330ea13cba6605e2df6f4';
    const { months = 6 } = req.query;
    
    const data = await analyticsService.getGrowthTrendData(userId, parseInt(months));
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching growth trend data',
      error: error.message
    });
  }
};

const getCommunityAnalytics = async (req, res) => {
  try {
    const analytics = await analyticsService.getCommunityAnalytics();
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching community analytics',
      error: error.message
    });
  }
};

module.exports = {
  // Tree Management
  getTrees,
  getTreeById,
  addTree,
  updateTree,
  deleteTree,
  
  // Care Records
  getCareRecords,
  addCareRecord,
  updateCareRecord,
  
  // Growth Measurements
  addGrowthMeasurement,
  getGrowthMeasurements,
  
  // Care Reminders
  getCareReminders,
  markReminderCompleted,
  
  // Analytics
  getDashboardStats,
  getAnalyticsReport,
  getGrowthTrend,
  getCommunityAnalytics
};
