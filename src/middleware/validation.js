const { body, param, query } = require('express-validator');

// Tree validation rules
const validateTree = [
  body('name')
    .notEmpty()
    .withMessage('Tree name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Tree name must be between 2 and 100 characters'),
  
  body('species')
    .notEmpty()
    .withMessage('Species is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Species must be between 2 and 100 characters'),
  
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Location must be between 2 and 200 characters'),
  
  body('plantDate')
    .optional()
    .isISO8601()
    .withMessage('Plant date must be a valid date'),
  
  body('height')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Height must be a positive number between 0 and 100 meters'),
  
  body('diameter')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Diameter must be a positive number between 0 and 5 meters'),
  
  body('healthStatus')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor'])
    .withMessage('Health status must be one of: excellent, good, fair, poor'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  body('coordinates.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('coordinates.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
];

// Care record validation rules
const validateCareRecord = [
  body('treeId')
    .isMongoId()
    .withMessage('Valid tree ID is required'),
  
  body('action')
    .isIn(['watering', 'fertilizing', 'pruning', 'pest_control', 'other'])
    .withMessage('Action must be one of: watering, fertilizing, pruning, pest_control, other'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  body('healthRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Health rating must be between 1 and 5'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  
  body('duration')
    .optional()
    .isInt({ min: 0, max: 1440 })
    .withMessage('Duration must be between 0 and 1440 minutes'),
  
  body('weather.temperature')
    .optional()
    .isFloat({ min: -50, max: 60 })
    .withMessage('Temperature must be between -50 and 60 degrees'),
  
  body('weather.humidity')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity must be between 0 and 100 percent'),
  
  body('weather.precipitation')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Precipitation must be a positive number'),
  
  body('weather.conditions')
    .optional()
    .isIn(['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'foggy'])
    .withMessage('Weather conditions must be one of: sunny, cloudy, rainy, snowy, stormy, foggy'),
  
  body('materials')
    .optional()
    .isArray()
    .withMessage('Materials must be an array'),
  
  body('materials.*.name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Material name must be between 1 and 100 characters'),
  
  body('materials.*.quantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Material quantity must be a positive number'),
  
  body('materials.*.unit')
    .optional()
    .isIn(['kg', 'g', 'L', 'mL', 'pieces', 'bags'])
    .withMessage('Material unit must be one of: kg, g, L, mL, pieces, bags')
];

// Growth measurement validation rules
const validateGrowthMeasurement = [
  body('treeId')
    .isMongoId()
    .withMessage('Valid tree ID is required'),
  
  body('height')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Height must be a positive number between 0 and 100 meters'),
  
  body('diameter')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Diameter must be a positive number between 0 and 5 meters'),
  
  body('canopySpread')
    .optional()
    .isFloat({ min: 0, max: 50 })
    .withMessage('Canopy spread must be between 0 and 50 meters'),
  
  body('trunkCircumference')
    .optional()
    .isFloat({ min: 0, max: 20 })
    .withMessage('Trunk circumference must be between 0 and 20 meters'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  
  body('measuredBy')
    .optional()
    .isIn(['user', 'expert', 'automated'])
    .withMessage('Measured by must be one of: user, expert, automated'),
  
  body('measurementMethod')
    .optional()
    .isIn(['manual', 'laser', 'tape', 'app', 'other'])
    .withMessage('Measurement method must be one of: manual, laser, tape, app, other'),
  
  body('accuracy')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Accuracy must be between 0 and 100 percent'),
  
  body('weather.temperature')
    .optional()
    .isFloat({ min: -50, max: 60 })
    .withMessage('Temperature must be between -50 and 60 degrees'),
  
  body('weather.humidity')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Humidity must be between 0 and 100 percent'),
  
  body('weather.conditions')
    .optional()
    .isIn(['sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'foggy'])
    .withMessage('Weather conditions must be one of: sunny, cloudy, rainy, snowy, stormy, foggy')
];

// Care reminder validation rules
const validateCareReminder = [
  body('treeId')
    .isMongoId()
    .withMessage('Valid tree ID is required'),
  
  body('type')
    .isIn(['watering', 'fertilizing', 'pruning', 'health_check'])
    .withMessage('Type must be one of: watering, fertilizing, pruning, health_check'),
  
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'seasonal', 'custom'])
    .withMessage('Frequency must be one of: daily, weekly, monthly, seasonal, custom'),
  
  body('customFrequency.days')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Custom frequency days must be at least 1'),
  
  body('customFrequency.weeks')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Custom frequency weeks must be non-negative'),
  
  body('customFrequency.months')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Custom frequency months must be non-negative'),
  
  body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('Is recurring must be a boolean value')
];

// Query parameter validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'species', 'plantDate', 'healthStatus'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Valid ID is required')
];

const validateAnalyticsPeriod = [
  query('period')
    .optional()
    .isIn(['3months', '6months', '1year'])
    .withMessage('Period must be one of: 3months, 6months, 1year'),
  
  query('months')
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage('Months must be between 1 and 24')
];

module.exports = {
  validateTree,
  validateCareRecord,
  validateGrowthMeasurement,
  validateCareReminder,
  validatePagination,
  validateId,
  validateAnalyticsPeriod
};
