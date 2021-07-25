const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: 'Bio',
  },
  resetLink: {
    data: String,
    default: '',
  },
  resetToken: String,
  expireToken: Date,
  followers: [{ type: ObjectId, ref: 'User' }],
  following: [{ type: ObjectId, ref: 'User' }],
  savedPosts: [{ type: ObjectId, ref: 'Post' }],
});

mongoose.model('User', userSchema);
