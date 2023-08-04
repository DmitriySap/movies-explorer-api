const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const TokenIncorrectError = require('../utils/tokenIncorrectError');

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Некорректный email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new TokenIncorrectError('Пользователя с такой почтой не существует.'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new TokenIncorrectError('Неправильные почта или пароль.'));
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
