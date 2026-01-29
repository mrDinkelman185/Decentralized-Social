const express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    rateLimit = require('express-rate-limit');

// Rate limiting for login GET endpoint (file system operation protection)
const loginGetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 requests per windowMs
    message: 'Too many requests to login page, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for login POST endpoint (authentication brute-force protection)
const loginPostLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per windowMs
    message: 'Too many login attempts, please try again after 15 minutes.',
    skipSuccessfulRequests: true, // Don't count successful logins
    standardHeaders: true,
    legacyHeaders: false,
});

router.get('/',
    loginGetLimiter, // Rate limiting for file system operation
    require('connect-ensure-login').ensureLoggedOut(),
    (req, res) => {
        res.render('login', {
            user : null,
            pageTitle : 'Login',
            csrfToken : req.csrfToken(),
            errors : {
                email : req.flash('email'),
                password : req.flash('password')
            }
        });
    });

router.post('/',
    loginPostLimiter, // Rate limiting for authentication operations
    passport.authenticate('localLogin', {
        successRedirect : '/',
        failureRedirect : '/login',
        failureFlash : true
    }));

module.exports = router;

