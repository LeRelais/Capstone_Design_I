const express = require('express')
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');

const dbUrl = 'mongodb://127.0.0.1:27017/capstone'
// 'mongodb://127.0.0.1:27017/yelp-camp'
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();
app.use(express.urlencoded({ extended: true }));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('home')
});

app.listen(3000, () => {
    console.log('Serving on port 3000')
})