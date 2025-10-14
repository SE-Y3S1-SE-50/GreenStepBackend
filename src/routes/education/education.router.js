const express = require('express');
const router = express.Router();
const {
  getAllContent,
  getContentById,
  getAllQuizzes,
  getQuizById,
  submitQuiz,
  getUserQuizProgress
} = require('../../controllers/education.controller');
const { authenticateToken, optionalAuth } = require('../../middleware/auth');

// Public routes - anyone can view content
router.get('/content', getAllContent);
router.get('/content/:contentId', getContentById);
router.get('/quizzes', getAllQuizzes);
router.get('/quizzes/:quizId', getQuizById);

// Protected routes - require authentication
router.post('/quizzes/:quizId/submit', authenticateToken, submitQuiz);
router.get('/progress', authenticateToken, getUserQuizProgress);

module.exports = router;