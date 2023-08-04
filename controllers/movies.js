const IncorrectDataError = require('../utils/incorrectDataError');
const NotFoundError = require('../utils/notFoundError');
const ForbiddenError = require('../utils/forbiddenError');
const Movie = require('../models/movie');

module.exports.getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movies) => res.send(movies))
    .catch((err) => next(err));
};

module.exports.createMovie = (req, res, next) => {
  Movie.create({
    ...req.body,
    owner: req.user._id,
  })
    .then((movies) => res.send(movies))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Переданы некорректные данные.'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Карточки с указанным ID не существует.');
      }
      if (movie.owner.toString() !== req.user._id) {
        throw new ForbiddenError('Нельзя удалить чужую карточку.');
      }
      Movie.findByIdAndRemove(req.params._id)
        .then(() => res.send({ message: `Фильм ${req.params._id} удален` }))
        .catch((err) => next(err));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Переданы некорректные данные.'));
      } else {
        next(err);
      }
    });
};
