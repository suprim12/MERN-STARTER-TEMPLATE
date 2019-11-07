const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const pasport = require('passport');
const ratelimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = express();
const version = 'v1';

/*  Routes Imports */
/* ADD HERE------------------ */

/*  MIDDLEWARE */
app.use(helmet());
const limiter = ratelimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request, Please try again later.'
});
app.use('/api', limiter);
app.use(pasport.initialize());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: ['duration', 'price', 'difficulty']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);
if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'));
}

/* DATABASE CONNECT */
let DB_URL;
if (process.env.NODE_ENV === 'prod') {
  DB_URL = process.env.DATABASE_PROD;
} else {
  DB_URL = process.env.DATABASE_DEV;
}
mongoose.set('useCreateIndex', true);
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log(`Connected to db`))
  .catch(err => console.log(`Connection Error ${err}`));

/* ROUTES */
/* ADD HERE------------------ */

/* ERROR HANDLING FOR 404 ROUTE  */
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: 'Cannot found any route'
  });
});

/* LISTEN */
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening at port ${port}`));
