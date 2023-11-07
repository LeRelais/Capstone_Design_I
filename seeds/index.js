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
    for(let i = 0; ; i++){
        if(!movies[i])
            break
        var plotText
        if(movies[i].plots.plot.length == 2)
            plotText = movies[i].plots.plot[0].plotText
        else
            plotText = movies[i].plots.plot.plotText
        const movie = new Movie({
            title: `${movies[i].title}`,
            prodYear: `${movies[i].prodYear}`,
            directorName: `${movies[i].directorNm}`,
            rating: `${movies[i].rating}`,
            genre: `${movies[i].genre}`,
            plot: `${plotText}`,
            poster: `${movies[i].poster}`,
            trailer: `${movies[i].trailer}`
        })
        await movie.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})