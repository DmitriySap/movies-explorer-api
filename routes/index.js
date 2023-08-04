const router = require('express').Router();
const auth = require('../middlewares/auth');
const userRouter = require('./userRouter');
const movieRouter = require('./movieRouter');
const { validationCreateUser, validationLoginUser } = require('../middlewares/joiUserValidator');
const { login, createUser } = require('../controllers/users');

router.post('/signin', validationLoginUser, login);
router.post('/signup', validationCreateUser, createUser);
router.use(auth);
router.use(userRouter);
router.use(movieRouter);

module.exports = router;
