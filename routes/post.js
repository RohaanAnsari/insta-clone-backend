const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middleware/requireLogin');
const Post = mongoose.model('Post');
const User = mongoose.model('User');

router.get('/allpost', requireLogin, (req, res) => {
  Post.find({ postedBy: { $ne: req.user._id } })
    .sort({ createdAt: -1 })
    .populate('postedBy', 'id name profilePicture')
    .populate('comments.postedBy', '_id name profilePicture')
    .then((posts) => {
      return res.status(200).json({
        posts,
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post('/createpost', requireLogin, (req, res) => {
  const { title, body, pic } = req.body;
  if (!title || !body || !pic) {
    return res.status(206).json({ error: 'Please add all the fields' });
  }
  req.user.password = undefined;
  const post = new Post({
    title,
    body,
    photo: pic,
    postedBy: req.user,
  });
  post
    .save()
    .then((result) => {
      return res.status(201).json({ post: result });
    })
    .catch((error) => {
      console.log(error);
    });
});

router.get('/mypost', requireLogin, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate('postedBy', '_id name profilePicture')
    .populate('comments.postedBy', '_id name profilePicture')
    .sort({ createdAt: -1 })
    .then((mypost) => {
      return res.status(200).json({ mypost });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put('/like', requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: {
        likes: req.user._id,
      },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(206).json({ error: err });
    } else {
      return res.status(200).json({ result });
    }
  });
});

router.put('/unlike', requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(206).json({ error: err });
    } else {
      return res.status(200).json({ result });
    }
  });
});

router.put('/comment', requireLogin, (req, res) => {
  const comment = {
    text: req.body.text,
    postedBy: req.user._id,
  };
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: {
        comments: comment,
      },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res.status(206).json({ error: err });
    } else {
      return res.status(200).json(result);
    }
  });
});

router.delete('/deletepost/:postId', requireLogin, (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .populate('postedBy', '_id')
    .exec((err, post) => {
      if (err || !post) {
        return res.status(206).json({ error: err });
      }
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then((result) => {
            return res.status(200).json({ message: 'Deleted successfully' });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
});

router.delete('/deletecomment/:postId/:commentId', requireLogin, (req, res) => {
  Post.findByIdAndUpdate(
    { _id: req.params.postId },
    {
      $pull: { comments: { _id: req.params.commentId } },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (result) {
      return res.status(200).json(result);
    }
    if (err) {
      res.status(206).json({ error: err });
    }
  });
});

router.post('/savepost', requireLogin, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $push: { savedPosts: req.body.id },
    },
    {
      new: true,
    }
  );
  return res.status(200).json(user);
});

router.post('/unsavepost', requireLogin, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { savedPosts: req.body.id },
    },
    {
      new: true,
    }
  );
  return res.status(200).json(user);
});

router.post('/get-savedposts', requireLogin, async (req, res) => {
  try {
    const ids = req.body.ids;
    console.log(ids);
    Post.find({
      _id: {
        $in: ids,
      },
    })
      .populate('postedBy', '_id name fullName profilePicture')
      .then((post) => {
        res.status(200).json(post);
      });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
