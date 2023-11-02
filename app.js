const express = require('express')
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session')
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override')
const flash = require('connect-flash')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const users = require('./controllers/users')
const userRoutes = require('./routes/users')
const Movie = require('./models/movies')
const Review = require('./models/review')
const {reviewSchema} = require('./schemas.js')

const dbUrl = 'mongodb://127.0.0.1:27017/capstone'
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')));

const secret = 'secretkeyblahblahblah'

const sessionConfig = {
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
    saveUninitialized: true,
    cokkie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

//review 생성 전 valid한지 확인하는 middleware
const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else
        next()
}

app.use('/', userRoutes)

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/movies', catchAsync(async (req, res) => {
    const movies = await Movie.find({})
    res.render('movies/index', {movies})
}))

app.get('/movies/:id', catchAsync(async(req, res) => {
    const movie = await Movie.findById(req.params.id).populate('reviews') //Review db에 있는 정보를 movie db에 치환해서 넣는걸 기다리는 작업. SQL에서 join과 비슷한 역할
    console.log(movie)
    res.render('movies/show', {movie})
}))


app.post('/movies/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const movie = await Movie.findById(req.params.id)
    const review = new Review(req.body.review)
    movie.reviews.push(review);
    await review.save()
    await movie.save()
    res.redirect(`/movies/${movie._id}`)
}))

app.listen(3000, () => {
    console.log('Serving on port 3000')
})

//change  retry again

