const userRouter = require('express').Router();
const { getUser, editUser } = require('../controllers/users');
const { validationUserEdit } = require('../middlewares/joiUserValidator');

userRouter.get('/users/me', getUser);
userRouter.patch('/users/me', validationUserEdit, editUser);

module.exports = userRouter;
