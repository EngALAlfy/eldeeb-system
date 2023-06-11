const express = require('express');
const router = express.Router();
const passport = require('passport');
const ensure = require('connect-ensure-login');
const uuidv1 = require('uuid/v1');
const generatePassword = require('password-generator');

const logger = require('../utils/error-logger.js');
const tools = require('../utils/tools.js');
const moment = require('moment');
const Admin = require('../models/admin');
const Employee = require('../models/employee');

router.use(passport.initialize());
router.use(passport.session());


// admins
router.get('/',
    ensure.ensureAuthenticated("/admin/login"),
    function (req, res) {
        tools.checkRole(req, res, "admins", function () {
            Admin.find({}, function (err, admins) {
                if (err) {
                    logger.error("error while get admins " + err);
                    res.render('admins/admins', {error: err});
                    return;
                }
                res.render('admins/admins', {user: req.user, admins: admins});
            });
        });

    });


router.get('/add', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "add-admin", function () {
        Employee.find({}, function (err, employees) {
            if (err) {
                res.render('error', {message: err});
                logger.error("error while get employees to add admin : " + err);
            } else {
                res.render('admins/add-admin', {user: req.user, success : req.query.success , employees: employees});
            }
        });
    });
});

router.post('/processing/add', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "add-admin", function () {

        let roles = [];

        Object.entries(req.body).forEach(([key, value]) => {
           if(key !== 'admin' && value === 'on'){
               roles.push(key);
           }
        });

        Employee.findOne({id: req.body.admin}, function (err, employee) {
            if (err) {
                res.render('error', {message: err});
                logger.error("error while get employees to save admin : " + err);
            } else {
                let json = {
                    id: employee.id,
                    photo: employee.photo,
                    name: employee.name,
                    username: employee.username,
                    password: employee.password,
                    roles: roles,
                };

                let admin = new Admin(json);

                admin.save(function (err) {
                    if (err) {
                        logger.error("error while add new admin " + err);
                        res.render('error', {title: "error while add a new admin", message: err});
                    } else {
                        res.redirect('/admin/admins/add?success=true');
                    }

                });
            }
        });
    });
});

router.get('/edit', ensure.ensureAuthenticated("/admin/"), function (req, res) {

});

router.post('/processing/edit', ensure.ensureAuthenticated("/admin/"), function (req, res) {

});

router.get('/remove/:id', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "admins", function () {
        Admin.findOneAndRemove({id: req.params.id}, function (err, result) {
            if (err) {
                logger.error("error while delete admin " + err);
                res.render("error", {message: err});
            } else {
                res.redirect('/admin/admins');
            }
        });
    });
});

router.get('/view/:id', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "admins", function () {
        Admin.findOne({id: req.params.id}, function (err, admin) {
            if (err) {
                logger.error("error while view admin " + err);
                res.render("error", {message: err});
            } else {
                res.render("admins/view-admin", {user: req.user, admin: admin});
            }
        });
    });
});

module.exports = router;