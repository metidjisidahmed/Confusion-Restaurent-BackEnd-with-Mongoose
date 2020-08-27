

var express = require('express');
const  userRouter = express.Router();
const UsersWithExpressSession = require('../models/users');
const bodyParser = require("body-parser");

userRouter.use(bodyParser.json());

/* GET users listing. */

userRouter.route('/signup')
    .post((req, res, next) => {
        const username = req.body.username;
        UsersWithExpressSession.findOne({username : username})
            .then((user)=>{
                if(user!==null){
                    res.statusCode = 403;
                    res.setHeader('Content-Types', 'text/plain');
                    res.end('The user ' + user.username + 'already exists !');
                }else{
                    UsersWithExpressSession.create(req.body)
                        .then((user)=>{
                            res.statusCode = 200;
                            res.end('Registration Completed !');
                        })
                }
            }, (err)=>{return next(err)})
            .catch((err)=>{return next(err)})
    });

userRouter.route('/login')
    .post((req, res, next) => {
        if(!req.session.user){
                const authorization = req.headers.authorization;
                // If the user didnt give us the username and password in the authentificcation we have to display the pop up again
                if(!authorization){
                    res.setHeader('WWW-Authenticate','Basic');
                    const err = new Error('You are not authenticated !');
                    err.status = 401;
                    next(err);
                }
                var auth = new Buffer.from(authorization.split(' ')[1], 'base64').toString().split(':');
                var username = auth[0];
                var password = auth[1];
                UsersWithExpressSession.findOne({username : username})
                    .then(user=>{
                        if(user===null){
                            res.setHeader('Content-Type', 'text/plain');
                            const err = new Error('The User '+ username+ ' doesnt exist !');
                            err.status = 403;
                            next(err);
                        }else if (user.password !==password){
                            res.setHeader('Content-Type', 'text/plain');
                            const err = new Error('Wrong password !');
                            err.status = 403;
                            next(err);
                        }else{
                            req.session.user = 'authenticated';
                            res.statusCode = 200;
                            res.redirect('/');
                        }
                    }, err=>next(err))
                    .catch(err=>next(err));
            }
        else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You are already authentificated !');
        }
    });

userRouter.route('/logout')
    .get((req, res, next) => {
        if (req.session) {
            req.session.destroy();
            res.clearCookie('user');
            res.redirect('/');
        }
        else {
            var err = new Error('You are not logged in!');
            err.status = 403;
            next(err);
        }
    });
module.exports = userRouter;
