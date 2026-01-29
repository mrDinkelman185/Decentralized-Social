const express = require('express'),
    router = express.Router(),
    passport = require('passport'),
    rateLimit = require('express-rate-limit');

// Rate limiting for register GET endpoint (file system operation protection)
const registerGetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 requests per windowMs
    message: 'Too many requests to register page, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for register POST endpoint (authentication brute-force protection)
const registerPostLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 registration attempts per windowMs
    message: 'Too many registration attempts, please try again after 15 minutes.',
    skipSuccessfulRequests: true, // Don't count successful registrations
    standardHeaders: true,
    legacyHeaders: false,
});

router.get('/',
    registerGetLimiter, // Rate limiting for file system operation
    require('connect-ensure-login').ensureLoggedOut(),
    (req, res) => {
        res.render('register', {
            user : null,
            pageTitle : 'Register',
            csrfToken : req.csrfToken(),
            errors : {
                username : req.flash('username'),
                email : req.flash('email')
            }
        });
    });

router.post('/',
    registerPostLimiter, // CWE-770: rate limit before passport.authenticate to prevent brute-force
    require('connect-ensure-login').ensureLoggedOut(),
    passport.authenticate('localRegister', {
        successRedirect : '/',
        failureRedirect : '/register',
        failureFlash : true
    })
);


module.exports = router;

