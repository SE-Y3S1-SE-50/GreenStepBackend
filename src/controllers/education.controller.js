const EducationalContent = require('../models/educationalContent.model');
const Quiz = require('../models/quiz.model');
const QuizProgress = require('../models/quizProgress.model');

// Get all educational content organized by sections
const getAllContent = async (req, res) => {
  try {
    const content = await EducationalContent.find({ isActive: true })
      .sort({ sectionId: 1, order: 1 });
    
    // Organize content by sections
    const organizedContent = {};
    content.forEach(item => {
      if (!organizedContent[item.sectionId]) {
        organizedContent[item.sectionId] = [];
      }
      organizedContent[item.sectionId].push({
        id: item.contentId,
        title: item.title,
        content: item.content
      });
    });

    res.json({
      success: true,
      data: organizedContent
    });
  } catch (error) {
    console.error('Error fetching educational content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching educational content',
      error: error.message
    });
  }
};

// Get content by ID
const getContentById = async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const content = await EducationalContent.findOne({ 
      contentId, 
      isActive: true 
    });

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: content.contentId,
        title: content.title,
        content: content.content
      }
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
};

// Create educational content (NEW)
const createContent = async (req, res) => {
  try {
    const content = new EducationalContent(req.body);
    await content.save();
    
    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating content',
      error: error.message
    });
  }
};

// Bulk create content (NEW)
const bulkCreateContent = async (req, res) => {
  try {
    const contents = await EducationalContent.insertMany(req.body);
    
    res.status(201).json({
      success: true,
      message: `${contents.length} content items created successfully`,
      data: contents
    });
  } catch (error) {
    console.error('Error bulk creating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk creating content',
      error: error.message
    });
  }
};

// Update educational content (NEW)
const updateContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const content = await EducationalContent.findOneAndUpdate(
      { contentId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: content
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating content',
      error: error.message
    });
  }
};

// Delete educational content (NEW)
const deleteContent = async (req, res) => {
  try {
    const { contentId } = req.params;
    
    const content = await EducationalContent.findOneAndUpdate(
      { contentId },
      { isActive: false },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting content',
      error: error.message
    });
  }
};

// Get all quizzes
const getAllQuizzes = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const quizzes = await Quiz.find(filter).select('-questions.correctAnswer');

    res.json({
      success: true,
      data: quizzes.map(quiz => ({
        quizId: quiz.quizId,
        title: quiz.title,
        category: quiz.category,
        difficulty: quiz.difficulty,
        points: quiz.points,
        questionCount: quiz.questions.length
      }))
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quizzes',
      error: error.message
    });
  }
};

// Get quiz by ID (without answers)
const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findOne({ quizId, isActive: true });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Remove correct answers from response
    const quizData = {
      quizId: quiz.quizId,
      title: quiz.title,
      category: quiz.category,
      difficulty: quiz.difficulty,
      points: quiz.points,
      questions: quiz.questions.map(q => ({
        questionId: q.questionId,
        question: q.question,
        options: q.options
      }))
    };

    res.json({
      success: true,
      data: quizData
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz',
      error: error.message
    });
  }
};

// Create quiz (NEW)
const createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    
    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating quiz',
      error: error.message
    });
  }
};

// Update quiz (NEW)
const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findOneAndUpdate(
      { quizId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating quiz',
      error: error.message
    });
  }
};

// Delete quiz (NEW)
const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quiz = await Quiz.findOneAndUpdate(
      { quizId },
      { isActive: false },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting quiz',
      error: error.message
    });
  }
};

// Submit quiz answers
const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedAnswer }
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const quiz = await Quiz.findOne({ quizId, isActive: true });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const detailedAnswers = [];

    quiz.questions.forEach(question => {
      const userAnswer = answers.find(a => a.questionId === question.questionId);
      const isCorrect = userAnswer && userAnswer.selectedAnswer === question.correctAnswer;
      
      if (isCorrect) correctAnswers++;

      detailedAnswers.push({
        questionId: question.questionId,
        question: question.question,
        selectedAnswer: userAnswer?.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);
    const pointsEarned = score >= 70 ? quiz.points : Math.floor(quiz.points * 0.5);

    // Save progress
    const progress = new QuizProgress({
      userId,
      quizId: quiz.quizId,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      pointsEarned,
      answers: answers.map(a => ({
        questionId: a.questionId,
        selectedAnswer: a.selectedAnswer,
        isCorrect: detailedAnswers.find(da => da.questionId === a.questionId)?.isCorrect
      }))
    });

    await progress.save();

    // Update user's total points
    const User = require('../models/users.mongo');
    await User.findByIdAndUpdate(userId, {
      $inc: { totalPoints: pointsEarned }
    });

    res.json({
      success: true,
      data: {
        score,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        pointsEarned,
        passed: score >= 70,
        detailedAnswers
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz',
      error: error.message
    });
  }
};

// Get user's quiz progress
const getUserQuizProgress = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const progress = await QuizProgress.find({ userId })
      .sort({ completedAt: -1 });

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error fetching quiz progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz progress',
      error: error.message
    });
  }
};

module.exports = {
  // Content endpoints
  getAllContent,
  getContentById,
  createContent,
  bulkCreateContent,
  updateContent,
  deleteContent,
  
  // Quiz endpoints
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getUserQuizProgress
};