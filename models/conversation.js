const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    members: { type: Array },
  },
  { timestamps: true }
);

mongoose.model('Conversation', ConversationSchema);
