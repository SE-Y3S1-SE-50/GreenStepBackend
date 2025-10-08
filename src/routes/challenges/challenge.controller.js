const Challenge = require('../../models/challenges.mongo');
const User = require('../../models/users.mongo');

// Get all challenges
const getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ isActive: true })
      .populate('createdBy', 'username firstName lastName')
      .populate('participants.user', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Failed to fetch challenges' });
  }
};

// Get single challenge
const getChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const challenge = await Challenge.findById(id)
      .populate('createdBy', 'username firstName lastName')
      .populate('participants.user', 'username firstName lastName');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    res.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ message: 'Failed to fetch challenge' });
  }
};

// Create new challenge
const createChallenge = async (req, res) => {
  try {
    const { title, description, category, difficulty, points, duration, target, unit, imageUrl } = req.body;
    
    // Validate required fields
    if (!title || !description || !category || !difficulty) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['title', 'description', 'category', 'difficulty']
      });
    }
    
    // Get user ID from JWT token
    const userId = req.user._id;
    
    console.log('Creating challenge with data:', {
      title, description, category, difficulty, points, duration, target, unit, imageUrl, userId
    });
    
    const challenge = new Challenge({
      title,
      description,
      category,
      difficulty,
      points: points || 10,
      duration: duration || 7,
      target: target || 1,
      unit: unit || 'days',
      imageUrl: imageUrl || '',
      createdBy: userId
    });
    
    console.log('Challenge object created:', challenge);
    console.log('Saving challenge to database...');
    
    await challenge.save();
    console.log('Challenge saved successfully with ID:', challenge._id);
    
    // Award creation rewards
    const { awardChallengeCreation } = require('../../utils/rewards');
    const rewardInfo = await awardChallengeCreation(userId);
    
    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('createdBy', 'username firstName lastName');
    
    const response = {
      challenge: populatedChallenge,
      message: 'Challenge created successfully!',
      rewards: rewardInfo
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ 
      message: 'Failed to create challenge',
      error: error.message,
      details: error
    });
  }
};

// Join challenge
const joinChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Check if user already joined
    const alreadyJoined = challenge.participants.some(p => p.user.toString() === userId.toString());
    if (alreadyJoined) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }
    
    // Add user to participants
    challenge.participants.push({
      user: userId,
      joinedAt: new Date(),
      progress: 0,
      completed: false
    });
    
    await challenge.save();
    
    // Award joining rewards
    const { awardChallengeJoin } = require('../../utils/rewards');
    const rewardInfo = await awardChallengeJoin(userId);
    
    const updatedChallenge = await Challenge.findById(id)
      .populate('createdBy', 'username firstName lastName')
      .populate('participants.user', 'username firstName lastName');
    
    const response = {
      success: true,
      challenge: updatedChallenge,
      message: 'Successfully joined the challenge!',
      rewards: rewardInfo
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({ message: 'Failed to join challenge' });
  }
};

// Update challenge progress
const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    const userId = req.user._id;
    
    // Validate progress input
    if (progress === undefined || progress === null) {
      return res.status(400).json({ message: 'Progress value is required' });
    }
    
    if (typeof progress !== 'number' || progress < 0) {
      return res.status(400).json({ message: 'Progress must be a non-negative number' });
    }
    
    console.log('Updating progress:', { challengeId: id, userId, progress });
    
    const challenge = await Challenge.findById(id);
    if (!challenge) {
      console.log('Challenge not found:', id);
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    console.log('Challenge found:', challenge.title);
    
    // Find user in participants
    const participant = challenge.participants.find(p => p.user.toString() === userId.toString());
    if (!participant) {
      return res.status(400).json({ message: 'Not joined this challenge' });
    }
    
    const wasCompleted = participant.completed;
    
    // Update progress
    participant.progress = Math.min(progress, challenge.target);
    participant.completed = participant.progress >= challenge.target;
    
    await challenge.save();
    
    let rewardInfo = null;
    
    // If challenge was just completed, award rewards
    if (!wasCompleted && participant.completed) {
      const { awardChallengeCompletion } = require('../../utils/rewards');
      rewardInfo = await awardChallengeCompletion(userId, challenge);
    }
    
    const updatedChallenge = await Challenge.findById(id)
      .populate('createdBy', 'username firstName lastName')
      .populate('participants.user', 'username firstName lastName');
    
    const response = {
      challenge: updatedChallenge,
      rewards: rewardInfo
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ 
      message: 'Failed to update progress',
      error: error.message,
      details: error
    });
  }
};

// Get user's challenges
const getUserChallenges = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const challenges = await Challenge.find({
      'participants.user': userId,
      isActive: true
    })
      .populate('createdBy', 'username firstName lastName')
      .populate('participants.user', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ message: 'Failed to fetch user challenges' });
  }
};

// Get challenges created by user
const getCreatedChallenges = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const challenges = await Challenge.find({
      createdBy: userId,
      isActive: true
    })
      .populate('createdBy', 'username firstName lastName')
      .populate('participants.user', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching created challenges:', error);
    res.status(500).json({ message: 'Failed to fetch created challenges' });
  }
};

module.exports = {
  getAllChallenges,
  getChallenge,
  createChallenge,
  joinChallenge,
  updateProgress,
  getUserChallenges,
  getCreatedChallenges
};
