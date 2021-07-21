const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../keys');
const mailer = require('../middleware/mailer');

router.post('/signup', (req, res) => {
  const { fullName, name, email, password, profilePicture } = req.body;
  if (!email || !name || !password || !fullName) {
    return res.status(206).json({ error: 'Please add all the fields' });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res
          .status(206)
          .json({ error: 'User already exist with that email' });
      }
      bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User({
          fullName,
          name,
          email,
          profilePicture,
          password: hashedPassword,
        });
        const message = 'Welcome to insta_clone';
        const subject = 'Welcome to insta_clone';
        const html = `
        <p>Welcome ${user.name} to our insta-clone</p>
        `;

        user.save().then(() => mailer(user.email, message, subject, html));
        res.status(201).json({ message: 'User Created Successfully' });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(206).json({ error: 'Please add email and password' });
  }
  User.findOne({ email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(206).json({ error: 'Invalid Email or password' });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((didMatched) => {
        if (didMatched) {
          const {
            _id,
            fullName,
            name,
            email,
            profilePicture,
            followers,
            following,
          } = savedUser;
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET, {
            expiresIn: '30d',
          });
          return res.status(200).json({
            token,
            user: {
              _id,
              fullName,
              name,
              email,
              profilePicture,
              followers,
              following,
            },
          });
        } else {
          return res.status(206).json({ error: 'Invalid Email or password' });
        }
      })
      .catch((err) => {
        console.log('errorrrr', err);
      });
  });
});

module.exports = router;
