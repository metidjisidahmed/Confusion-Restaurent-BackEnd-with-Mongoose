const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);

const Currency = mongoose.Types.Currency;
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    rating:  {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:  {
        type: String,
        required: true
    },
    author:  {
        type: mongoose.Schema.Types.ObjectID,
        ref : 'user',
        required: true
    }
}, {
    timestamps: true
});

const dishSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image : {
        required : true ,
        type : String
    },
    category : {
        required : true ,
        type : String
    },
    price : {
        required : true ,
        type : Currency ,
        min: 0
    },
    label : {
        type : String,
        default : ''
    },
    featured : {
        type : Boolean,
        default : false
    },
    description: {
        type: String,
        required: true
    },
    comments : [commentSchema] // thats means array of Comment Schema objects
},{
    timestamps: true
});
// The collection will have the pluaral name ( so 'Dish' will became 'Dishes' ) 
var Dishes = mongoose.model('Dish', dishSchema);

module.exports = Dishes;