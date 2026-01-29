const express = require('express');
const path = require('node:path');
const session = require('express-session');
const bodyParse = require('body-parser');
const passport = require('./auth/passport');
const mongoose = require('mongoose');
const middleware = require('connect-ensure-login');
const MongoStore = require('connect-mongo');
const config = require('./config/default');
const flash = require('connect-flash');
const { csrfSync } = require('csrf-sync'); // CWE-352: CSRF protection
const port = process.env.PORT || config.server.port;
const app = express();
const node_media_server = require('./media_server');
const thumbnail_generator = require('./cron/thumbnails');

// Load environment variables
require('dotenv').config();

const utils = require('./utils');

// Security: Disable X-Powered-By header
app.disable('x-powered-by');

// Security: Add Helmet for security headers
const helmet = require('helmet');
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    crossOriginEmbedderPolicy: false
}));

// Security: Add rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all requests
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true,
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));
app.use(express.static('public'));
app.use('/thumbnails', express.static('server/thumbnails'));
app.use(flash());

app.use(require('cookie-parser')());
app.use(bodyParse.urlencoded({extended: true}));
app.use(bodyParse.json({extended: true}));

app.use(session({
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1/nodeStream',
        ttl: 14 * 24 * 60 * 60 // = 14 days. Default
    }),
    secret: config.server.secret,
    maxAge : Date.now() + (60 * 1000 * 30), // Fixed: Date.now() instead of Date().now
    resave : true,
    saveUninitialized : false,
    // CWE-352: SameSite + secure cookie to mitigate CSRF
    cookie: {
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
    },
}));

app.use(passport.initialize());
app.use(passport.session());

// CWE-352: CSRF protection via csrf-sync (Synchronizer Token Pattern)
const { csrfSynchronisedProtection } = csrfSync({
    getTokenFromRequest: (req) =>
        req.headers['x-csrf-token'] || (req.body && req.body._csrf),
});

app.use(csrfSynchronisedProtection);

// Register app routes (rate limit on auth to prevent brute-force)
app.use('/login', authLimiter, require('./routes/login'));
app.use('/register', authLimiter, require('./routes/register'));
app.use('/settings', require('./routes/settings'));
app.use('/streams', require('./routes/streams'));
app.use('/user', require('./routes/user'));

app.get('/logout', (req, res) => {
    req.logout();
    return res.redirect('/login');
});

app.get('*', middleware.ensureLoggedIn(), (req, res) => {
    res.render('index', { csrfToken: req.csrfToken() });
});

app.listen(port, () => console.log(`App listening on ${port}!`));
node_media_server.run();
thumbnail_generator.start();
