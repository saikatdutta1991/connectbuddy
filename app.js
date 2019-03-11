const createError = require('http-errors')
const express = require('express') //express module
const path = require('path')
const bodyParser = require("body-parser") //express body parser module
const db = require('./helpers/Database') //database connection setup


/** creating express app */
var app = express();


/** view engine setup */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
/** view engine setup end */

/** cross domain api call */
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Credentials", "true");
	res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Origin, Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

	next();
});
/** cross domain api call end*/

/** setup body parsers */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
/** setup body parsers end*/


/** enable access to public folder through browser */
app.use(express.static(path.join(__dirname, 'public')));


/** registering routes */
var indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
app.use('/', indexRouter);
app.use('/api/v1/user', userRouter);
/** registering routes end*/

/** catch 404 and forward to error handler */
app.use(function (req, res, next) {
	next(createError(404));
});

/** registering default error handler */
app.use(require('./helpers/ErrorHandler'));


/** exporting whole express app module */
module.exports = app;