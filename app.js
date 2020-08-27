var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
var commentRouter = require('./routes/commentRouter');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const leaderRouter = require('./routes/leaderRouter');
const promoRouter = require('./routes/promoRouter');
const uploadRouter = require('./routes/uploadRouter');
const favoriteRouter = require('./routes/favoriteRouter');
var passport = require('passport');
var authenticate = require('./authenticate');

var app = express();
// For all the incoming request , if its not a secured request ( if its came from a http server ) :
// we redirect it to our https server with status code : 307 ( redirection without changing the content of the header request )  
app.all('*' , (req, res, next) => {
  if(req.secure){
    return next();
  }else{
    res.redirect(307,'https://' + req.hostname + ':' + app.get('secPort')+req.url);
  }
});
const config = require('./config');
const url = config.mongoUrl;
const connect = mongoose.connect(url);
connect.then((db)=>{
  console.log(url);
  console.log('The DataBase is connected with the server now ')
}).catch((err)=>{
  console.log(err.message)});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/comments',commentRouter);

// DOING BASIC AUTHENTIFICATION USING COOKIES :
// 1/WHY THE AUTHENTIFICATION  :  the authentification help us to prevent the user to do any request to our server before identifying himself ( user name and password )
// 2/WHY USING THE COOKIES : using the cookies , the user have to identify himself only once and then he can do any request , without cookies the user have to identify himself every time he did a  request
// IMPORTANT : note that the cookieParser need a secret key to encode the incoming cookies
// app.use(cookieParser("SecretKey"));
//
// function myAuth(req , res , next){
//   const authorization = req.headers.authorization;
//   if(!req.signedCookies.user){
//     if (!authorization) {
//       res.setHeader('WWW-Authenticate', 'Basic');
//       const err = new Error('Error 401 : Failed to authenticate !');
//       err.status = 401;
//       next(err);
//     }else {
//       // the authorization will be in form : 'Basic Base64String'
//       // with base64String is 'username:password' encoded in base64
//       const usernameAndPasswordEncoded = authorization.split(' ')[1];
//       const usernameAndPassword = new Buffer.from(usernameAndPasswordEncoded, 'base64').toString();
//       const username = usernameAndPassword.split(':')[0];
//       const password = usernameAndPassword.split(':')[1];
//       if (username === 'admin' && password === 'password') {
//         res.cookie('user', 'admin' , {signed : true});
//         next();
//       }else{
//         res.setHeader('WWW-Authenticate', 'Basic');
//         const err = new Error('Error 401 : Failed to authenticate !');
//         err.statusCode = 401;
//         next(err);
//       }
//     }
//   }else{
//     if(req.signedCookies.user ==='admin'){
//       next();
//     }else{
//       const err = new Error('Error 401 : Failed to authenticate !');
//       err.statusCode = 401;
//       next(err);
//     }
//   }
// }

// app.use(session({
//   name : 'session-id',
//   secret : 'SecretKey',
//   store: new FileStore(),
//   resave : false ,
//   saveUninitialized :false
// }));
app.use(passport.initialize());
// app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);
// function myAuth (req, res, next) {
//   console.log(req.user);
//
//   if (!req.user) {
//     var err = new Error('You are not authenticated!');
//     err.status = 403;
//     next(err);
//   }
//   else {
//     next();
//   }
// }
// // We did / and /users route above the session because the client can surf into them without need to authenticate himself
//
// app.use(myAuth);

// function auth (req, res, next) {
//   console.log(req.headers);
//   var authHeader = req.headers.authorization;
//   if (!authHeader) {
//     var err = new Error('You are not authenticated!');
//     res.setHeader('WWW-Authenticate', 'Basic');
//     err.status = 401;
//     next(err);
//     return;
//   }
//
//   var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
//   var user = auth[0];
//   var pass = auth[1];
//   if (user == 'admin' && pass == 'password') {
//     next(); // authorized
//   } else {
//     var err = new Error('You are not authenticated!');
//     res.setHeader('WWW-Authenticate', 'Basic');
//     err.status = 401;
//     next(err);
//   }
// }
//
// app.use(auth);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/imageUpload', uploadRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promoRouter);
app.use('/dishes', dishRouter);
app.use('/favorites', favoriteRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
