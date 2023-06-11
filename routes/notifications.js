const express = require('express');
const router = express.Router();
const passport = require('passport');
const ensure = require('connect-ensure-login');
const uuidv1 = require('uuid/v1');
const generatePassword = require('password-generator');

const logger = require('../utils/error-logger.js');
const tools = require('../utils/tools.js');
const moment = require('moment');
const Notification = require('../models/notification');
const Employee = require('../models/employee');

router.use(passport.initialize());
router.use(passport.session());


// notifications
router.get('/',
    ensure.ensureAuthenticated("/admin/login"),
    function (req, res) {
        tools.checkRole(req, res, "notifications", function () {
            Notification.find({}, function (err, notifications) {
                if (err) {
                    logger.error("error while get notifications " + err);
                    res.render('notifications/notifications', {error: err});
                    return;
                }
                res.render('notifications/notifications', {user: req.user, notifications: notifications});
            });
        });

    });


router.get('/add', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "add-notification", function () {
        Employee.find({}, function (err, employees) {
            if (err) {
                logger.error("error while add get employees in notification " + err);
                res.render('error', {title: "error while add get employees in notification", message: err});
            } else {
                res.render('notifications/add-notification', {user: req.user, employees: employees , success : req.query.success});
            }
        });
    });
});

router.post('/processing/add', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "add-notification", function () {

        let employees = [];

        let employeesArray = req.body.employees;

        if (employeesArray) {
            if (Array.isArray(employeesArray)) {
                for (let key in employeesArray) {
                    if (!employeesArray[key]) {
                        continue;
                    }

                    employees.push(employeesArray[key]);
                }
            } else {
                employees.push(employeesArray);
            }
        }


        let json = {
            id: uuidv1(),
            title: req.body.title,
            message: req.body.message,
            //employees_read:[{id:String , date:Date}],
            employees: employees,
        };

        let notification = new Notification(json);
        notification.save(function (err) {
            if (err) {
                logger.error("error while add new notification " + err);
                res.render('error', {title: "error while add a new notification", message: err});
            } else {
                res.redirect('/admin/notifications/add?success=1');
            }

        });

    });
});

router.get('/edit', ensure.ensureAuthenticated("/admin/"), function (req, res) {

});

router.post('/processing/edit', ensure.ensureAuthenticated("/admin/"), function (req, res) {

});

router.get('/remove/:id', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "contractors", function () {
        Contractor.deleteOne({id: req.params.id}, function (err) {
            if (err) {
                logger.error("error while delete contractor " + err);
                res.render("error", {message: err});
            } else {
                res.redirect('/admin/contractors');
            }
        });
    });
});

router.get('/view/:id', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "notifications", function () {
        Notification.findOne({id: req.params.id}, function (err, contractor) {
            if (err) {
                logger.error("error while view contractor " + err);
                res.render("error", {message: err});
            } else {
                res.render("contractors/view-contractor", {user: req.user, contractor: contractor});
            }
        });
    });
});

module.exports = router;