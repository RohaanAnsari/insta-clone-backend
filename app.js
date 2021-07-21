const express = require('express');
const mongoose = require('mongoose');
const { MONGOURI } = require('./keys');
const cors = require('cors');
const app = express();
// const httpServer = require('http').createServer(app);

app.use(cors());

mongoose
  .connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Database Connected');
  })
  .catch((err) => {
    console.log('Error Connecting', err);
  });

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use(express.json());

// Models
require('./models/user');
require('./models/post');
require('./models/conversation');
require('./models/message');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const userRoutes = require('./routes/user');
const ConversationRoutes = require('./routes/conversations');
const messagesRoutes = require('./routes/messages');

// Routes
app.use(authRoutes);
app.use(postRoutes);
app.use(userRoutes);
app.use(ConversationRoutes);
app.use(messagesRoutes);

var PORT = process.env.PORT || 5000;

var server = app.listen(PORT || process.env.port, () => {
  console.log('Server listening on port', PORT);
});
