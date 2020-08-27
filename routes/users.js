

var express = require('express');
const User = require('../models/users');
const passport = require('passport');
const authenticate = require('../authenticate');
const  userRouter = express.Router();
const UsersWithExpressSession = require('../models/users');
const bodyParser = require("body-parser");
const cors = require('./cors');

userRouter.use(bodyParser.json());

/* GET users listing. */
// in the signup we give the user name and the password in the body of the request
// we use the register method which is provided from passport-local-mongoose
// if we will have an eroor : we simply display it
// else , we authenticate the user locally
userRouter.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); } )
userRouter.get( '/' ,cors.cors , authenticate.verifyUser , authenticate.verifyAdmin , ((req, res, next) => {
    User.find({})
        .then((users)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'json/application');
            res.json(users);
        },(err)=>{return next(err)})
        .catch(err=>{return next(err)})
}));
userRouter.post('/signup', cors.corsWithOptions, (req, res, next) => {
    User.register(new User({username: req.body.username}),
        req.body.password, (err, user) => {
            if(err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
            }
            else {
                if(req.body.firstname){user.firstname= req.body.firstname}
                if(req.body.lastname){user.lastname=req.body.lastname}
                user.save()
                    .then((user,err)=>{
                        if(err){
                            res.statusCode = 500;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({err: err});
                            return ;
                        }
                        passport.authenticate('local')(req, res, () => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json({success: true, status: 'Registration Successful!' , user: user});
                    })
                });
            }
        });
});

// for the login : if the informations are corrct , we will create a token to the logged user ( remember that in the token we store the id of the user ) 
userRouter.post('/login',cors.corsWithOptions,  (req, res, next) => {
    passport.authenticate('local' , (err , user , info)=>{
        if(err){
            return next(err)
        }
        if(!user){
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: false, status: 'Login Unsuccessful!', err: info});
        }
        req.logIn(user , (err)=>{
            if(err){
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: false, status: 'Login Unsuccessful!', err: 'Could not log in user!'});
            }
            var token = authenticate.getToken({_id : req.user._id});
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({success: true,token : token ,  status: 'You are successfully logged in!'});
        })
    })(req,res,next);
});

userRouter.route('/logout')
    .get(cors.cors ,(req, res, next) => {
        if (req.session) {
            req.session.destroy();
            res.clearCookie('session-id');
            res.redirect('/');
        }
        else {
            var err = new Error('You are not logged in!');
            err.status = 403;
            next(err);
        }
    });

userRouter.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
    if (req.user) {
        var token = authenticate.getToken({_id: req.user._id});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, token: token, status: 'You are successfully logged in!'});
    }
});
userRouter.get('/checkJWTtoken', cors.corsWithOptions, (req, res) => {
    passport.authenticate('jwt', {session: false}, (err, user, info) => {
        if (err)
            return next(err);

        if (!user) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            return res.json({status: 'JWT invalid!', success: false, err: info});
        }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({status: 'JWT valid!', success: true, user: user});

        }
    }) (req, res);
});
module.exports = userRouter;
