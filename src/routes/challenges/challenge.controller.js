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
// Join challenge
// Join challenge
const joinChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Add logging to debug
    console.log('🔍 Join challenge request:', {
      challengeId: id,
      userId: req.user?.id,
      userObjectId: req.user?._id,
      userInfo: req.user
    });
    
    if (!req.user || (!req.user.id && !req.user._id)) {
      console.log('❌ No user found in request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const userId = req.user._id || req.user.id;
    console.log('🔍 Using userId:', userId);
    
    const challenge = await Challenge.findById(id);
    if (!challenge) {
      console.log('❌ Challenge not found:', id);
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    console.log('✅ Challenge found:', challenge.title);
    console.log('🔍 Current participants:', challenge.participants.length);
    
    // Check if user already joined
    const alreadyJoined = challenge.participants.some(p => {
      const participantId = p.user.toString();
      const currentUserId = userId.toString();
      console.log('🔍 Comparing:', { participantId, currentUserId, match: participantId === currentUserId });
      return participantId === currentUserId;
    });
    
    if (alreadyJoined) {
      console.log('⚠️ User already joined this challenge');
      return res.status(400).json({ 
        success: false,
        message: 'Already joined this challenge' 
      });
    }
    
    // Add user to participants
    challenge.participants.push({
      user: userId,
      joinedAt: new Date(),
      progress: 0,
      completed: false
    });
    
    console.log('💾 Saving challenge with new participant...');
    await challenge.save();
    console.log('✅ Challenge saved successfully');
    
    // Award joining rewards
    const { awardChallengeJoin } = require('../../utils/rewards');
    const rewardInfo = await awardChallengeJoin(userId);
    console.log('🎁 Rewards awarded:', rewardInfo);
    
    const updatedChallenge = await Challenge.findById(id)
      .populate('createdBy', 'username firstName lastName')
      .populate('participants.user', 'username firstName lastName');
    
    const response = {
      success: true,
      challenge: updatedChallenge,
      message: 'Successfully joined the challenge!',
      rewards: rewardInfo
    };
    
    console.log('✅ Sending success response');
    res.json(response);
  } catch (error) {
    console.error('❌ Error joining challenge:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Failed to join challenge',
      error: error.message 
    });
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

// Get challenge leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    
    const challenge = await Challenge.findById(id)
      .populate('participants.user', 'username firstName lastName profilePicture');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    // Sort participants by progress (descending)
    const leaderboard = challenge.participants
      .map(participant => ({
        user: {
          _id: participant.user._id,
          username: participant.user.username,
          firstName: participant.user.firstName,
          lastName: participant.user.lastName,
          profilePicture: participant.user.profilePicture || ''
        },
        progress: participant.progress,
        completed: participant.completed,
        joinedAt: participant.joinedAt
      }))
      .sort((a, b) => b.progress - a.progress);
    
    res.json({
      success: true,
      leaderboard: leaderboard,
      challenge: {
        id: challenge._id,
        title: challenge.title,
        target: challenge.target,
        unit: challenge.unit
      }
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};


module.exports = {
  getAllChallenges,
  getChallenge,
  createChallenge,
  joinChallenge,
  updateProgress,
  getUserChallenges,
  getCreatedChallenges,
  getLeaderboard
};
