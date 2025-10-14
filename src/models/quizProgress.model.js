const mongoose = require('mongoose');

const quizProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizId: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  pointsEarned: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  answers: [{
    questionId: String,
    selectedAnswer: Number,
    isCorrect: Boolean
  }]
});

// Index for efficient queries
quizProgressSchema.index({ userId: 1, quizId: 1 });
quizProgressSchema.index({ userId: 1, completedAt: -1 });

module.exports = mongoose.model('QuizProgress', quizProgressSchema);
