const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const favoriteSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : 'user',
        required : true
    },
    dishes : [{type : Schema.Types.ObjectId, ref : 'Dish'}]
},
    {
        timestamps : true
    }
);

const Favorites = mongoose.model('favorite', favoriteSchema);

module.exports = Favorites;

