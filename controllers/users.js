const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const NotFoundError = require('../utils/notFoundError');
const IncorrectDataError = require('../utils/incorrectDataError');
const NotUniqueEmailError = require('../utils/notUniqueEmailError');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUser = (req, res, next) => {
  User.findOne({ _id: req.user._id })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => next(err));
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email,
  } = req.body;

  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      User.create({
        name, email, password: hash,
      })
        .then((user) => res.send({
          name: user.name, email: user.email,
        }))
        .catch((err) => {
          if (err.code === 11000) {
            next(new NotUniqueEmailError('Пользователь с такой почтой уже существует.'));
          } else if (err.name === 'ValidationError') {
            next(new IncorrectDataError('Переданы некорректные данные'));
          } else {
            next(err);
          }
        });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'super-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => next(err));
};

module.exports.editUser = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .orFail(() => new NotFoundError('Пользователь не найден.'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'NotFound') {
        next(new NotFoundError('Пользователь не найден.'));
      } else if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Переданы некорректные данные.'));
      } else if (err.code === 11000) {
        next(new NotUniqueEmailError('Пользователь с такой почтой уже существует.'));
      } else {
        next(err);
      }
    });
};
