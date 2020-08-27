const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

// when we use passport-local-mongoose we dint have to declare password field in the Schema
var User = new Schema({
    firstname :{
        type : String ,
        default : ''
    },
    facebookId: {type:String},
    lastname : {
        type : String ,
        default : ''
    },
    admin:   {
        type: Boolean,
        default: false
    }
});

User.plugin(passportLocalMongoose);


const Users = mongoose.model('user', User);
module.exports= Users ;