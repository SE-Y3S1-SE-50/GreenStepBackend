const express = require('express');
const router = express.Router();

const dashboardController = require('../../controllers/dashboard.controller');
const { authenticateToken, rateLimit } = require('../../middleware/auth');
const {
  validateTree,
  validateCareRecord,
  validateGrowthMeasurement,
  validateCareReminder,
  validatePagination,
  validateId,
  validateAnalyticsPeriod
} = require('../../middleware/validation');

// Skip authentication for development - allow unauthenticated access to dashboard data
// router.use(authenticateToken);

// Apply rate limiting
router.use(rateLimit(15 * 60 * 1000, 100)); // 100 requests per 15 minutes

// Tree Management Routes
router.get('/trees', validatePagination, dashboardController.getTrees);
router.get('/trees/:id', validateId, dashboardController.getTreeById);
router.post('/trees', validateTree, dashboardController.addTree);
router.put('/trees/:id', validateId, validateTree, dashboardController.updateTree);
router.delete('/trees/:id', validateId, dashboardController.deleteTree);

// Care Records Routes
router.get('/care-records', validatePagination, dashboardController.getCareRecords);
router.post('/care-records', validateCareRecord, dashboardController.addCareRecord);
router.put('/care-records/:id', validateId, validateCareRecord, dashboardController.updateCareRecord);

// Growth Measurements Routes
router.get('/trees/:treeId/growth-measurements', validateId, dashboardController.getGrowthMeasurements);
router.post('/growth-measurements', validateGrowthMeasurement, dashboardController.addGrowthMeasurement);

// Care Reminders Routes
router.get('/care-reminders', dashboardController.getCareReminders);
router.patch('/care-reminders/:id/complete', validateId, dashboardController.markReminderCompleted);

// Analytics Routes
router.get('/stats', dashboardController.getDashboardStats);
router.get('/analytics/report', validateAnalyticsPeriod, dashboardController.getAnalyticsReport);
router.get('/analytics/growth-trend', validateAnalyticsPeriod, dashboardController.getGrowthTrend);
router.get('/analytics/community', dashboardController.getCommunityAnalytics);

module.exports = router;
