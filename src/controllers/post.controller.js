const Post = require("../models/post.model");

// ----------------------
// Create a new post
// ----------------------
const createPost = async (req, res) => {
  try {
    const { user, text, image } = req.body;

    if (!user || !text) {
      return res.status(400).json({ message: "User and text are required" });
    }

    const newPost = new Post({ user, text, image });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Server error creating post" });
  }
};

// ----------------------
// Get all posts
// ----------------------
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ message: "Server error fetching posts" });
  }
};





module.exports = { createPost, getAllPosts };
