const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    text: { type: String, required: true },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
