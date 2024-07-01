// middlewares/index.js

const userMiddleware = require('./user');
const postMiddleware = require('./post');
const commentMiddleware = require('./comment');
const authMiddleware = require('./auth');
const errorHandler = require('./errorHandler')

module.exports = {
  userMiddleware,
  postMiddleware,
  commentMiddleware,
  authMiddleware,
  errorHandler
};
