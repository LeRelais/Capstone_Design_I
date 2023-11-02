const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    title : String,
    prodYear : String,
    directorName : String,
    rating : String,
    genre : String,
    plot : String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

module.exports = mongoose.model('Movie', MovieSchema)