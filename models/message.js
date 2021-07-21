const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const MessaegeSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    sender: {
      type: ObjectId,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);

mongoose.model('Message', MessaegeSchema);
