import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  user: { type: String, required: true },
  text: { type: String, required: true },
  image: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", postSchema);
export default Post;

