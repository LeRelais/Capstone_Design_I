const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

// router.route('/register')
//     .get(users.renderRegister)
//     .post(catchAsync(users.register));

// router.route('/login')
//     .get(users.renderLogin)
//     .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async(req, res) => {
    const {email, username, password, prefergenre, preferdirector, preferactor} = req.body
    //console.log(req.body)
    const user = new User({email,username, prefergenre, preferdirector, preferactor})
    const registeredUser = await User.register(user, password)
    console.log(registeredUser)
    //req.flash('success', 'welcome')
    res.redirect('/movies')
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'welcome back')
    res.redirect('/movies')
})

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/movies'); // Redirect after logging out
    });
})

router.get('/mypage', catchAsync(async(req, res) => {
    res.send(currentUser.username)
    //res.render('users/mypage', {user})
}))

router.post('/mypage/:id', catchAsync(async(req, res) => {
    console.log(req.user)
}))

// router.get('/logout', users.logout)

module.exports = router;