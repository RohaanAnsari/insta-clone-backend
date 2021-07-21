const express = require('express');
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const User = mongoose.model('User');
const Conversation = mongoose.model('Conversation');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { ObjectId } = mongoose.Types.ObjectId;
const requireLogin = require('../middleware/requireLogin');
const mailer = require('../middleware/mailer');

router.get('/user/:id', requireLogin, (req, res) => {
  User.findOne({ _id: req.params.id })
    .select('-password')
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        .populate('postedBy', '_id name profilePicture')
        .exec((err, posts) => {
          if (err) {
            return res.status(206).json({ error: err });
          }
          return res.status(200).json({ user, posts });
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(206).json({ error: 'User not found' });
    });
});

router.post('/users/info', (req, res) => {
  const ids = req.body.ids;
  User.find({
    _id: {
      $in: ids.map((id) => id),
    },
  })
    .select('-password -__v -followers -following -bio')
    .then((user) => {
      return res.status(200).json({ user });
    })
    .catch((err) => {
      console.log(err);
      return res.status(206).json({ error: 'User not found' });
    });
});

router.get('/getallusers', requireLogin, (req, res) => {
  User.find({})
    .select('-password -__v')
    .then((users) => {
      res.status(200).json({ users });
    });
});

router.get('/getsubposts', requireLogin, (req, res) => {
  Post.find({
    $or: [{ postedBy: req.user.following }, { postedBy: req.user._id }],
  })
    .sort({ createdAt: -1 })
    .populate('postedBy', '_id name profilePicture')
    .populate('comments.postedBy', '_id, name profilePicture')

    .then((posts) => {
      return res.status(200).json({ posts });
    })
    .catch((err) => {
      console.error(err);
    });
});

router.put('/follow', requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { following: req.body.followId },
        },
        { new: true }
      )
        .select('-password')
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
});

router.put('/unfollow', requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    {
      $pull: { followers: req.user._id },
    },
    {
      new: true,
    },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: req.body.unfollowId },
        },
        { new: true }
      )
        .select('-password')
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
});

router.put('/updateprofilepicture', requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { profilePicture: req.body.profilePicture } },
    { new: true },
    (err, result) => {
      result.password = undefined;
      if (err) {
        return res.status(206).json({ error });
      }
      return res.status(200).json({ result });
    }
  );
});

router.put('/updatebio', requireLogin, (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { bio: req.body.bio } },
    { new: true },
    (err, result) => {
      result.password = undefined;
      if (err) {
        return res.status(206).json({ error });
      }
      return res.status(200).json({ result });
    }
  );
});

router.post('/search-user', (req, res) => {
  let userPattern = new RegExp('^' + req.body.query);
  User.find({ email: { $regex: userPattern } })
    .then((user) => {
      return res.status(200).json({ user });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post('/reset-password', (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res.status(206).json({ error: 'User does not exist ' });
      }
      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;
      user.save().then((result) => {
        const message = 'Verify your Email';
        const subject = 'Reset your password';
        const html = `
        <div>
        <h3>Click on this <a href='http://localhost:3000/reset/${token}'>link</a> to reset your password</h3>
        </div>
        `;
        mailer(user.email, message, subject, html);
      });
      return res.status(200).json({ message: 'Please check your email' });
    });
  });
});

router.post('/new-password', (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({
    resetToken: sentToken,
    expireToken: { $gt: Date.now() },
  }).then((user) => {
    if (!user) {
      return res.status(206).json({ error: 'Try again Session Expired' });
    }
    bcrypt
      .hash(newPassword, 12)
      .then((hashedPassword) => {
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.expireToken = undefined;
        user.save().then((savedUser) => {
          return res
            .status(200)
            .json({ message: 'Password successfully updated' });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

router.get('/get-followers/:id', (req, res) => {
  User.find({ _id: req.params.id })
    .populate('followers', '_id name fullName profilePicture')
    .select('_id name profilePicture fullName')
    .then((user) => {
      return res.status(200).json({ user });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/get-followings/:id', (req, res) => {
  User.find({ _id: req.params.id })
    .populate('following', '_id name fullName profilePicture')
    .select('_id name profilePicture fullName')
    .then((user) => {
      return res.status(200).json({ user });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
