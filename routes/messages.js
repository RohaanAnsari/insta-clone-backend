const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Message = mongoose.model('Message');
const User = mongoose.model('User');

router.post('/messages', async (req, res) => {
  console.log(req.body.message.text);
  console.log(req.body.message.sender);
  console.log(req.body.message.conversationId);
  console.log('completeMEssagE', req.body);
  const newMessage = new Message({
    conversationId: req.body.message.conversationId,
    sender: req.body.message.sender,
    text: req.body.message.text,
  });
  try {
    const savedMessage = await newMessage.save();
    return res.status(200).json({ savedMessage });
  } catch (error) {
    console.log(err);
  }
});

router.post('/messages/:conversationId', requireLogin, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });

    return res.status(200).json({ messages });
  } catch (err) {
    console.log(err);
  }
});

router.get('/receiver/:id', async (req, res) => {
  const user = await User.findById({ _id: req.params.id }).select(
    'name profilePicture'
  );

  return res.status(200).json({ user });
});

module.exports = router;
