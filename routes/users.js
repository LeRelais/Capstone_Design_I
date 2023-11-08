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

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async(req, res) => {
    const {email, username, password} = req.body
    const user = new User({email,username})
    const registeredUser = await User.register(user, password)
    //console.log(registeredUser)
    req.flash('success', 'welcome')
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
    const user = req.user
    res.render('users/mypage', {user})
}))

// router.get('/logout', users.logout)

module.exports = router;