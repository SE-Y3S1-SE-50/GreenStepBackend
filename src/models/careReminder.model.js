const mongoose = require('mongoose');

const careReminderSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['watering', 'fertilizing', 'pruning', 'health_check'],
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: {
    type: String,
    default: ''
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'seasonal', 'custom'],
    default: 'monthly'
  },
  customFrequency: {
    days: {
      type: Number,
      min: 1
    },
    weeks: {
      type: Number,
      min: 0
    },
    months: {
      type: Number,
      min: 0
    }
  },
  lastCompleted: {
    type: Date
  },
  nextDueDate: {
    type: Date
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  reminderSent: {
    type: Boolean,
    default: false
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
careReminderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate next due date for recurring reminders
  if (this.isRecurring && this.isCompleted && !this.nextDueDate) {
    this.calculateNextDueDate();
  }
  
  next();
});

// Index for efficient queries
careReminderSchema.index({ userId: 1, dueDate: 1 });
careReminderSchema.index({ treeId: 1, dueDate: 1 });
careReminderSchema.index({ isCompleted: 1, dueDate: 1 });
careReminderSchema.index({ priority: 1 });

// Method to calculate next due date
careReminderSchema.methods.calculateNextDueDate = function() {
  if (!this.isRecurring) return;
  
  const now = new Date();
  let nextDue = new Date(now);
  
  switch (this.frequency) {
    case 'daily':
      nextDue.setDate(nextDue.getDate() + 1);
      break;
    case 'weekly':
      nextDue.setDate(nextDue.getDate() + 7);
      break;
    case 'monthly':
      nextDue.setMonth(nextDue.getMonth() + 1);
      break;
    case 'seasonal':
      nextDue.setMonth(nextDue.getMonth() + 3);
      break;
    case 'custom':
      if (this.customFrequency) {
        nextDue.setDate(nextDue.getDate() + (this.customFrequency.days || 0));
        nextDue.setDate(nextDue.getDate() + (this.customFrequency.weeks || 0) * 7);
        nextDue.setMonth(nextDue.getMonth() + (this.customFrequency.months || 0));
      }
      break;
  }
  
  this.nextDueDate = nextDue;
};

// Method to check if reminder is overdue
careReminderSchema.methods.isOverdue = function() {
  const now = new Date();
  return now > this.dueDate && !this.isCompleted;
};

// Method to get days until due
careReminderSchema.methods.getDaysUntilDue = function() {
  const now = new Date();
  const diffTime = this.dueDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Method to mark as completed
careReminderSchema.methods.markCompleted = function() {
  this.isCompleted = true;
  this.lastCompleted = new Date();
  
  if (this.isRecurring) {
    this.calculateNextDueDate();
    // Create new reminder for next occurrence
    this.constructor.create({
      treeId: this.treeId,
      userId: this.userId,
      type: this.type,
      dueDate: this.nextDueDate,
      priority: this.priority,
      notes: this.notes,
      frequency: this.frequency,
      customFrequency: this.customFrequency,
      isRecurring: this.isRecurring
    }).catch(err => console.error('Error creating next reminder:', err));
  }
};

// Static method to get overdue reminders
careReminderSchema.statics.getOverdueReminders = async function(userId) {
  const now = new Date();
  
  return await this.find({
    userId,
    dueDate: { $lt: now },
    isCompleted: false
  }).populate('treeId', 'name species location');
};

// Static method to get upcoming reminders
careReminderSchema.statics.getUpcomingReminders = async function(userId, days = 7) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return await this.find({
    userId,
    dueDate: { $gte: now, $lte: futureDate },
    isCompleted: false
  }).populate('treeId', 'name species location');
};

// Static method to create default reminders for a new tree
careReminderSchema.statics.createDefaultReminders = async function(treeId, userId) {
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const defaultReminders = [
    {
      treeId,
      userId,
      type: 'watering',
      dueDate: oneWeekFromNow,
      priority: 'high',
      notes: 'Initial watering reminder',
      frequency: 'weekly'
    },
    {
      treeId,
      userId,
      type: 'health_check',
      dueDate: oneMonthFromNow,
      priority: 'medium',
      notes: 'Monthly health check',
      frequency: 'monthly'
    }
  ];
  
  return await this.insertMany(defaultReminders);
};

module.exports = mongoose.model('CareReminder', careReminderSchema);
