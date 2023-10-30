const mongoose = require('mongoose');
const movies = require('./movie')
const Movie = require('../models/movies')

const dbUrl = 'mongodb://127.0.0.1:27017/capstone'
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB = async () => {
    await Movie.deleteMany({});
    for(let i = 0; i < 5; i++){
        const movie = new Movie({
            title: `${movies[i].title}`,
            prodYear: `${movies[i].prodYear}`,
            directorName: `${movies[i].directorNm}`,
            rating: `${movies[i].rating}`,
            genre: `${movies[i].genre}`
        })
        await movie.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})