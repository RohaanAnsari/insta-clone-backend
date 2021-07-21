const express = require('express');
const mongoose = require('mongoose');
const { MONGOURI } = require('./keys');
const cors = require('cors');
const app = express();
// const httpServer = require('http').createServer(app);

app.use(cors());

const PORT = 5000;

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

var server = app.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});

// const io = require('socket.io')(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST'],
//   },
// });

// let users = [];

// const addUser = (userId, socketId) => {
//   !users.some((user) => user.userId === userId) &&
//     users.push({ userId, socketId });
// };

// const removeUser = (socketId) => {
//   users = users.filter((user) => user.socketId !== socketId);
// };

// const getUser = (userId) => {
//   return users.find((user) => user.userId === userId);
// };

// io.on('connection', (socket) => {
//   console.log('A user connected');

//   socket.on('addUser', (userId) => {
//     addUser(userId, socket.id);
//     io.emit('getUsers', users);

//     // sending messages
//     socket.on('sendMessage', ({ senderId, receiverId, text }) => {
//       console.log(users);
//       const user = getUser(receiverId);
//       io.to(user.socketId).emit('getMessage', { senderId, text });
//     });
//   });

//   socket.on('disconnect', () => {
//     console.log('A user Disconnected');
//     removeUser(socket.id);
//     io.emit('getUsers', users);
//   });
// });
