const express = require('express');
const router = express.Router();
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const ensure = require('connect-ensure-login');
const uuidv1 = require('uuid/v1');
const logger = require('../utils/error-logger.js');
const tools = require('../utils/tools.js');

const Admin = require('../models/admin');
const Project = require('../models/project');
const Employee = require('../models/employee');
const Supplier = require('../models/supplier');
const Contractor = require('../models/contractor');

const employeesRouter = require('./employees');
const contractorsRouter = require('./contractors');
const suppliersRouter = require('./suppliers');
const projectsRouter = require('./projects');
const adminsRouter = require('./admins');
const notificationsRouter = require('./notifications');
const todoRouter = require('./todo');

router.use('/employees' , employeesRouter);
router.use('/contractors' , contractorsRouter);
router.use('/suppliers' , suppliersRouter);
router.use('/projects', projectsRouter);
router.use('/admins', adminsRouter);
router.use('/notifications', notificationsRouter);
router.use('/todo', todoRouter);

// passport
passport.use(new Strategy(
    {
        session: true
    },
    function (username, password, cb) {
        Admin.where({username: username}).findOne(function (err, user) {
            if (err) {
                logger.error(err);
                return cb(err);
            }
            if (!user) {
                return cb(null, false, {error: "no admin here !"});
            }
            if (user.password !== password) {
                return cb(null, false, {error: "incorrect password!"});
            }

            return cb(null, user);
        });
    }));

passport.serializeUser(function (user, cb) {
    cb(null, user.username);
});

passport.deserializeUser(function (username, cb) {
    Admin.where({username: username}).findOne(function (err, user) {
        if (err) {
            logger.error(err);
            return cb(err);
        }
        cb(null, user);
    });
});

// Initialize Passport and restore authentication state, if any, from the
// session.
router.use(passport.initialize());
router.use(passport.session());

// Define routes.
router.get('/', ensure.ensureAuthenticated("/admin/login"),
    function (req, res) {
        res.redirect("/admin/dashboard");
    });

// login
router.get('/login', ensure.ensureNotAuthenticated("/admin/"),
    function (req, res) {
        res.render('admins/login');
    });

router.post('/processing/login',
    passport.authenticate('local', {failureRedirect: '/admin/login', successRedirect: '/admin/', failureFlash: true}));

router.get('/logout',
    function (req, res) {
        req.logout();
        res.redirect('/admin/');
    });

// dashboard
router.get('/dashboard',
    ensure.ensureAuthenticated("/admin/login"),
    function (req, res) {
        tools.checkRole(req, res, "dashboard", function () {
            res.redirect('/admin/projects');
        });
    });

module.exports = router;
