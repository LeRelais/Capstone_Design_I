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

//const userRoutes = require('./routes/users')

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

//app.use('/', userRoutes)

app.get('/', (req, res) => {
    res.render('home')
})

//// app.get('/fakeUser', async(req, res) => {
//     const user = new User({email: 'test@test.com', username: 'test'})
//     const newUser = await User.register(user, 'test')
//     res.send(newUser)
// })

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.get('/register', (req, res) => {
    res.render('users/register')
})

app.post('/register', catchAsync(async(req, res) => {
    const {email, username, password, prefergenre, preferdirector, preferactor, prefermovie} = req.body
    //console.log(req.body)
    const user = new User({email,username, prefergenre, preferdirector, preferactor, prefermovie})
    const registeredUser = await User.register(user, password)
    console.log(registeredUser)
    //req.flash('success', 'welcome')
    res.redirect('/movies')
}))

app.get('/Img', (req, res) => {
    console.log('Img')
})

app.get('/login', (req, res) => {
    res.render('users/login')
})

app.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'welcome back')
    res.redirect('/movies')
})

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/movies'); // Redirect after logging out
    });
})

app.get('/mypage/:id', catchAsync(async(req, res) => {
    const user = await User.findById(req.params.id).populate('reviews')
    const moviebypreferdirector = await Movie.find({directorName : ` ${user.preferdirector} `})
    
    //res.send(user)
    //res.send(currentUser.username)
   // console.log(user)
   const reviewCount = user.reviews.length;
   
   const lastPage = parseInt(reviewCount / 6) + 1;
   //console.log(lastPage)
   var movieList = []
   const currentPage = parseInt(req.query.page) || 1;
   const type = req.query.type || "review"
    console.log(type)
   var movieTmp = null
 
    var tmp = 0

    if(user.reviews.length > (currentPage+1) * 6)
        tmp = (currentPage+1) * 6
    else
        tmp = user.reviews.length

    for(var i = (currentPage-1) * 6; i < tmp; i++){
        if(type == "review")
            movieTmp = await Movie.find({reviews: user.reviews[i]})
        else if(type == "preferdirector"){
            movieTmp = await Movie.find({directorName: user.preferdirector})
        }
        movieList.push(movieTmp)
    }
    //console.log(user.reviews.length)
    //res.send(review)
    res.render('users/mypage', {user, reviewCount, currentPage, lastPage, moviebypreferdirector, movieList, tmp})
}))

app.get('/chat', catchAsync(async(req, res) => {
    const user = req.user
    const username = user.username
    res.render('chat', {user, username})
}))

app.post('/chat', (req, res) => {
    res.render('chat')
})

app.get('/movies', catchAsync(async (req, res) => {
    const user = req.user
    const currentPage = parseInt(req.query.page) || 1;
    const movies = await Movie.find({})
    const allMovie = movies.length
    var lastPage = allMovie / 12;
    if(lastPage * 12 < allMovie)
        lastPage += 1

    //console.log(currentPage, viewOption)
    res.render('movies/index', {movies, currentPage, allMovie, lastPage, user})
}))

app.get('/movies/:id', catchAsync(async(req, res) => {
    const user = req.user;
    const movie = await Movie.findById(req.params.id).populate('reviews') //Review db에 있는 정보를 movie db에 치환해서 넣는걸 기다리는 작업. SQL에서 join과 비슷한 역할
    console.log(movie)
    res.render('movies/show', {movie, user})
}))


app.post('/movies/:id/reviews', validateReview, catchAsync(async(req, res) => {
    const movie = await Movie.findById(req.params.id)
    const curUser = req.user
    const user = await User.findById(curUser._id)
    const review = new Review(req.body.review)
    //console.log(curUser)
    //console.log(movie)
    movie.reviews.push(review)
    user.reviews.push(review)
    await review.save()
    await movie.save()
    await user.save()
    res.redirect(`/movies/${movie._id}`)
}))

app.get('/search', async(req, res) => {
    const query = req.body.key;
    const type = req.body.search_type
    const currentPage = parseInt(req.query.page) || 1;
    const curUser = req.user

    if(type == "director"){
        const movies = await Movie.find({directorName: ` ${query} `})
        const totalMovie = movies.length
        var lastPage = totalMovie / 12;
        if(lastPage * 12 < totalMovie)
            lastPage += 1
        if(!movies)
            res.send("Nothing found")
        else
            res.render('movies/search', {movies, curUser, currentPage, totalMovie, lastPage})
    }   
    else if(type == "title"){
        const movies = await Movie.find({title: { $regex: ` .*${query}.* `, $options: 'i' }})
        const totalMovie = movies.length
        var lastPage = totalMovie / 12;
        if(lastPage * 12 < totalMovie)
            lastPage += 1
        if(!movies)
            res.send("Nothing found")
        else
            res.render('movies/search', {movies, curUser, currentPage, totalMovie, lastPage})
    }
    else if(type == "actor"){
        const movies = await Movie.find({actor: ` ${query} `})
        const totalMovie = movies.length
        var lastPage = totalMovie / 12;
        if(lastPage * 12 < totalMovie)
            lastPage += 1
        if(!movies)
            res.send("Nothing found")
        else
            res.render('movies/search', {movies, curUser, currentPage, totalMovie, lastPage})
    }
    else if(type == "genre"){
        const movies = await Movie.find({genre: ` ${query} `})
        const totalMovie = movies.length
        var lastPage = totalMovie / 12;
        if(lastPage * 12 < totalMovie)
            lastPage += 1
        if(!movies)
            res.send("Nothing found")
        else
            res.render('movies/search', {movies, curUser, currentPage, totalMovie, lastPage})
    }
})

app.post('/search', async(req, res) => {
    const query = req.body.key;
    const type = req.body.search_type
    const currentPage = parseInt(req.query.page) || 1;
    const user = req.user

    if(type == "director"){
        const movies = await Movie.find({directorName: ` ${query} `})
        const totalMovie = movies.length
        var lastPage = totalMovie / 12;
        if(lastPage * 12 < totalMovie)
            lastPage += 1
        if(!movies)
            res.send("Nothing found")
        else
            res.render('movies/search', {movies, user, currentPage, totalMovie, lastPage})
    }   
    else if(type == "title"){
        const movies = await Movie.find({title: { $regex: ` .*${query}.* `, $options: 'i' }})
        const totalMovie = movies.length
        var lastPage = totalMovie / 12;
        if(lastPage * 12 < totalMovie)
            lastPage += 1
        if(!movies)
            res.send("Nothing found")
        else
            res.render('movies/search', {movies, user, currentPage, totalMovie, lastPage})
    }
    //console.log(req.body.search_type)
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})

//change  retry again

