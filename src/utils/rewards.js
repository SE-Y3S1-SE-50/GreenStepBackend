const { addUserBadge, addUserAchievement, incrementUserStats } = require('../../models/users.model');

// Badge definitions
const BADGES = {
  FIRST_CHALLENGE: {
    name: 'First Step',
    icon: '🌱',
    description: 'Completed your first challenge'
  },
  CHALLENGER: {
    name: 'Challenger',
    icon: '💪',
    description: 'Completed 5 challenges'
  },
  ECO_WARRIOR: {
    name: 'Eco Warrior',
    icon: '🌍',
    description: 'Completed 10 challenges'
  },
  GREEN_CHAMPION: {
    name: 'Green Champion',
    icon: '🏆',
    description: 'Completed 25 challenges'
  },
  PLANET_PROTECTOR: {
    name: 'Planet Protector',
    icon: '🌟',
    description: 'Completed 50 challenges'
  },
  CREATOR: {
    name: 'Creator',
    icon: '🛠️',
    description: 'Created your first challenge'
  },
  INNOVATOR: {
    name: 'Innovator',
    icon: '💡',
    description: 'Created 5 challenges'
  },
  LEADER: {
    name: 'Leader',
    icon: '👑',
    description: 'Created 10 challenges'
  },
  SOCIAL_BUTTERFLY: {
    name: 'Social Butterfly',
    icon: '🦋',
    description: 'Joined 10 challenges'
  },
  POINT_COLLECTOR: {
    name: 'Point Collector',
    icon: '💎',
    description: 'Earned 1000 points'
  },
  ENERGY_SAVER: {
    name: 'Energy Saver',
    icon: '⚡',
    description: 'Completed 5 energy challenges'
  },
  WASTE_WARRIOR: {
    name: 'Waste Warrior',
    icon: '♻️',
    description: 'Completed 5 waste challenges'
  },
  TRANSPORT_HERO: {
    name: 'Transport Hero',
    icon: '🚲',
    description: 'Completed 5 transport challenges'
  },
  WATER_GUARDIAN: {
    name: 'Water Guardian',
    icon: '💧',
    description: 'Completed 5 water challenges'
  },
  FOOD_HERO: {
    name: 'Food Hero',
    icon: '🥬',
    description: 'Completed 5 food challenges'
  }
};

// Check and award badges based on user progress
const checkAndAwardBadges = async (userId, userStats, completedChallenge = null) => {
  try {
    const newBadges = [];

    // Challenge completion badges
    if (userStats.challengesCompleted === 1) {
      newBadges.push(BADGES.FIRST_CHALLENGE);
    } else if (userStats.challengesCompleted === 5) {
      newBadges.push(BADGES.CHALLENGER);
    } else if (userStats.challengesCompleted === 10) {
      newBadges.push(BADGES.ECO_WARRIOR);
    } else if (userStats.challengesCompleted === 25) {
      newBadges.push(BADGES.GREEN_CHAMPION);
    } else if (userStats.challengesCompleted === 50) {
      newBadges.push(BADGES.PLANET_PROTECTOR);
    }

    // Challenge creation badges
    if (userStats.challengesCreated === 1) {
      newBadges.push(BADGES.CREATOR);
    } else if (userStats.challengesCreated === 5) {
      newBadges.push(BADGES.INNOVATOR);
    } else if (userStats.challengesCreated === 10) {
      newBadges.push(BADGES.LEADER);
    }

    // Challenge joining badges
    if (userStats.challengesJoined === 10) {
      newBadges.push(BADGES.SOCIAL_BUTTERFLY);
    }

    // Point-based badges
    if (userStats.totalPoints >= 1000) {
      newBadges.push(BADGES.POINT_COLLECTOR);
    }

    // Category-specific badges (if we have completed challenge info)
    if (completedChallenge) {
      const categoryBadges = {
        energy: BADGES.ENERGY_SAVER,
        waste: BADGES.WASTE_WARRIOR,
        transport: BADGES.TRANSPORT_HERO,
        water: BADGES.WATER_GUARDIAN,
        food: BADGES.FOOD_HERO
      };

      // This would need category completion tracking in the user model
      // For now, we'll award based on total completions
      if (userStats.challengesCompleted >= 5 && categoryBadges[completedChallenge.category]) {
        // In a real implementation, you'd track category-specific completions
        // For demo purposes, we'll award the first category badge encountered
      }
    }

    // Award new badges
    for (const badge of newBadges) {
      await addUserBadge(userId, badge);
    }

    return newBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
};

// Calculate level based on points
const calculateLevel = (points) => {
  return Math.floor(points / 100) + 1;
};

// Calculate points to next level
const calculatePointsToNextLevel = (points) => {
  const currentLevel = calculateLevel(points);
  const pointsForNextLevel = currentLevel * 100;
  return pointsForNextLevel - points;
};

// Award challenge completion rewards
const awardChallengeCompletion = async (userId, challenge) => {
  try {
    // Add achievement
    const achievement = {
      challengeId: challenge._id,
      challengeTitle: challenge.title,
      pointsEarned: challenge.points,
      completedAt: new Date()
    };

    const updatedUser = await addUserAchievement(userId, achievement);
    
    if (updatedUser) {
      // Check for new badges
      const newBadges = await checkAndAwardBadges(userId, updatedUser.statistics, challenge);
      
      return {
        pointsEarned: challenge.points,
        newLevel: calculateLevel(updatedUser.totalPoints),
        newBadges: newBadges,
        achievement: achievement
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error awarding completion rewards:', error);
    return null;
  }
};

// Award challenge creation rewards
const awardChallengeCreation = async (userId) => {
  try {
    const pointsEarned = 50; // Bonus points for creating a challenge
    
    // This would need to be implemented in the user model
    // For now, we'll just increment the creation count
    await incrementUserStats(userId, 'challengesCreated');
    
    return {
      pointsEarned: pointsEarned,
      message: 'Challenge created! You earned 50 bonus points.'
    };
  } catch (error) {
    console.error('Error awarding creation rewards:', error);
    return null;
  }
};

// Award joining rewards (small bonus for participation)
const awardChallengeJoin = async (userId) => {
  try {
    const pointsEarned = 5; // Small bonus for joining
    
    await incrementUserStats(userId, 'challengesJoined');
    
    return {
      pointsEarned: pointsEarned,
      message: 'Challenge joined! You earned 5 participation points.'
    };
  } catch (error) {
    console.error('Error awarding join rewards:', error);
    return null;
  }
};

module.exports = {
  BADGES,
  checkAndAwardBadges,
  calculateLevel,
  calculatePointsToNextLevel,
  awardChallengeCompletion,
  awardChallengeCreation,
  awardChallengeJoin
};