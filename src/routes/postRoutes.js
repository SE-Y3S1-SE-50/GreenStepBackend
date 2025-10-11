const express = require("express");
const { createPost, getAllPosts } = require("../controllers/post.controller");

const router = express.Router();

router.post("/create", createPost);
router.get("/", getAllPosts);

module.exports = router;
