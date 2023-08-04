require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
// eslint-disable-next-line spaced-comment
//const cors = require('./middlewares/cors');
const cors = require('cors');
const handleError = require('./middlewares/error');
const NotFoundError = require('./utils/notFoundError');

const router = require('./routes');

const { PORT = 3000 } = process.env;
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

mongoose.connect('mongodb://localhost:27017/bitfilmsdb')
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('connected to db');
  });

app.use(bodyParser.json());

app.use(requestLogger);

app.use(cors());

app.use(router);
app.use((req, res, next) => next(new NotFoundError('Ничего не найдено.')));

app.use(errorLogger);
app.use(errors());
app.use(handleError);
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening at port ${PORT}`);
});
