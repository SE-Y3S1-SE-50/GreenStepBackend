const express = require('express');
const {
  getAllChallenges,
  getChallenge,
  createChallenge,
  joinChallenge,
  updateProgress,
  getUserChallenges,
  getCreatedChallenges
} = require('./challenge.controller');
const { authenticateToken } = require('../../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllChallenges);
router.get('/:id', getChallenge);

// Protected routes - require authentication
router.post('/', authenticateToken, createChallenge);
router.post('/:id/join', authenticateToken, joinChallenge);
router.put('/:id/progress', authenticateToken, updateProgress);
router.get('/user/my-challenges', authenticateToken, getUserChallenges);
router.get('/user/created', authenticateToken, getCreatedChallenges);

module.exports = router;
