const express = require('express');
const router = express.Router();
const User = require('../model/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');


//#region Register
router.post('/register', function (req, res) {
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        profilePicture: req.body.profilePicture
    });
    User.getUserByUsername(newUser.username, function (err, existingUser) {
        if (err) {
            res.json({success: false, message: 'Failed to register user'});
        } else {
            if (existingUser) {
                res.json({success: false, message: 'User already exist'});
            } else {
                User.addUser(newUser, function (err, user) {
                    if (err) {
                        res.json({success: false, message: 'Failed to register user'})
                    } else {
                        res.json({success: true, message: 'User registerd'})
                    }
                })
            }
        }
    });


});
//#endregion


//#region Authenticate
router.post('/authenticate', function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, function (err, user) {
        if (err) throw err;
        if (!user) {
            return res.json({success: false, message: 'User not found'});
        }

        User.comparePassword(password, user.password, function (err, isMatch) {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign(user, config.secret, {
                    expiresIn: 604800 //1 week
                });

                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    user: {
                        id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email
                    }
                })
            } else {
                return res.json({success: false, message: 'Wrong username or password'});
            }

        })
    })
});
//endregions

//#region Profile
router.get('/profile', passport.authenticate('jwt', {session: false}), function (req, res, next) {
    const userId = req.user;
    res.json({user: req.user});
});
//endregions


module.exports = router;