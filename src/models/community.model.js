const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Community', communitySchema);
