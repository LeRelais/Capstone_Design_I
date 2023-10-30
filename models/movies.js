const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    title : String,
    prodYear : String,
    directorName : String,
    rating : String,
    genre : String
});

module.exports = mongoose.model('Movie', MovieSchema)