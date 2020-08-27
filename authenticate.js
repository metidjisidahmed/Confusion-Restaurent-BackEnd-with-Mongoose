var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');
const config = require('./config');
const jwt = require('jsonwebtoken');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy= require('passport-jwt').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');

passport.use(new LocalStrategy(User.authenticate() ,   (username, password, done)=> {
    console.log(' done : '+ done+ ' User name :' + username + ' password : '+password);
}));
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});


// Get Token is used to associate to each user a Token defined by unique Id using jwt.sign ( we give it the id of a user and the secret key  )
module.exports.getToken= function(user){
    return jwt.sign(user, config.secretKey , {expiresIn: 3600});
};
// the opts are used as an options to our jwt strategy to authnticate a uqser where :
// jwtfromRequest defines whedre we can find the id of the token ( its in Bearer header so we will use bearer token as a method of authentification )
//SecretOrKey to define the key used to encypt/decrypt the token
var opts= {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

//Jwt strategy defines how we can know if the user is authenticated ( we compare the _id of the token with _id of the user )
// this comparison is due to createa token using _id of the user in module.exports.getToken
module.exports.jwtPassport = passport.use(new JwtStrategy(opts , (jwt_payload , done)=>{
    User.findOne({_id : jwt_payload._id})
        .then((user , err)=>{
            if(err){
                return done(err, false);
            }else if(user){
                return done(null, user);
            }else{
                return done(null, false);
            }
        })
}));


// this module is so important , we use it as a middleware of our RestApi Methods if the user has to authenticate himself before doing the Rest action
// in our app , we didnt use this middlewatre in the get methods in all the routes so the user can access to the content f our website without authentification
// unlike put,delete,get which requires the user to authenticate himself using the if of the token
module.exports.verifyUser = passport.authenticate('jwt' , {session: false} );
module.exports.verifyAdmin = function(req,res,next){
    if(!req.user.admin){
        const err = new Error('You are not authorized to do this operation !');
        err.status = 403;
        return next(err)
    }else{
        next();
    }
};

exports.facebookPassport = passport.use(new FacebookTokenStrategy({
        clientID: config.Facebook.clientId,
        clientSecret: config.Facebook.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        User.findOne({facebookId: profile.id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (!err && user !== null) {
                return done(null, user);
            }
            else {
                user = new User({ username: profile.displayName });
                user.facebookId = profile.id;
                user.firstname = profile.name.givenName;
                user.lastname = profile.name.familyName;
                user.save((err, user) => {
                    if (err)
                        return done(err, false);
                    else
                        return done(null, user);
                })
            }
        });
    }
));