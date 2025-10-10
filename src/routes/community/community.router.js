const express = require('express');
const router = express.Router();
const Community = require('../../models/community.model');

// ✅ Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Community.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error });
  }
});

// ✅ Create a new post
router.post('/', async (req, res) => {
  try {
    const { user, content, image } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const newPost = new Community({ user, content, image });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error });
  }
});

module.exports = router;
