const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Conversation = mongoose.model('Conversation');

router.post('/conversations', async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });
  try {
    const savedConversation = await newConversation.save();
    return res.status(200).json({ savedConversation });
  } catch (err) {
    res.status(206).json({ err });
  }
});

router.get('/conversations/:userId', async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    return res.status(200).json({ conversation });
  } catch (err) {
    console.log(err);
  }
});

router.get('/conversations/b/w/:userId', requireLogin, async (req, res) => {
  try {
    const conversation = await Conversation.find({
      $and: [
        { members: req.user._id.toString() },
        { members: req.params.userId.toString() },
      ],
    });
    const id = conversation.map((value) => value._id.toString());
    id.join(', ');
    return res.status(200).json({ conversation, id });
  } catch (err) {
    console.log(err);
  }
});

router.delete('/conversation/:id', async (req, res) => {
  console.log(req.params.id);
  try {
    const conversation = await Conversation.findByIdAndDelete({
      _id: req.params.id,
    });
    return res
      .status(200)
      .json({ message: 'Deleted', conversation: conversation._id });
  } catch (error) {
    console.log(error);
  }
});

// just to ......

module.exports = router;
