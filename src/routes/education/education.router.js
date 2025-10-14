const express = require('express');
const router = express.Router();
const {
  getAllContent,
  getContentById,
  createContent,
  bulkCreateContent,
  updateContent,
  deleteContent,
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getUserQuizProgress
} = require('../../controllers/education.controller');
const { authenticateToken, optionalAuth } = require('../../middleware/auth');

// ============================================
// CONTENT ROUTES
// ============================================

// Public routes - anyone can view content
router.get('/content', getAllContent);
router.get('/content/:contentId', getContentById);

// Admin/Protected routes - for creating/updating content
// NOTE: Add authentication middleware as needed
router.post('/content', createContent);
router.post('/content/bulk', bulkCreateContent);
router.put('/content/:contentId', updateContent);
router.delete('/content/:contentId', deleteContent);

// ============================================
// QUIZ ROUTES
// ============================================

// Public routes - anyone can view quizzes
router.get('/quizzes', getAllQuizzes);
router.get('/quizzes/:quizId', getQuizById);

// Admin/Protected routes - for creating/updating quizzes
// NOTE: Add authentication middleware as needed
router.post('/quizzes', createQuiz);
router.put('/quizzes/:quizId', updateQuiz);
router.delete('/quizzes/:quizId', deleteQuiz);

// Protected routes - require authentication
router.post('/quizzes/:quizId/submit', authenticateToken, submitQuiz);
router.get('/progress', authenticateToken, getUserQuizProgress);

module.exports = router;