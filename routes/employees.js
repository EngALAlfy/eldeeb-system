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
const Project = require('../models/project');
const Employee = require('../models/employee');
const Supplier = require('../models/supplier');
const Contractor = require('../models/contractor');

router.use(passport.initialize());
router.use(passport.session());

// employees
router.get('/',
    ensure.ensureAuthenticated("/admin/login"),
    function (req, res) {
        tools.checkRole(req, res, "employees", function () {
            Employee.find({}, function (err, employees) {
                if (err) {
                    logger.error("error while get employees " + err);
                    res.render('employees/employees', {error: err});
                    return;
                }
                res.render('employees/employees', {user: req.user, employees: employees});
            });
        });

    });


router.get('/add', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "add-employee", function () {
        res.render('employees/add-employee', {user: req.user});
    });
});

router.post('/processing/add', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "add-employee", function () {
        let phones = [];

        let phonesArray = req.body.phones;

        if (Array.isArray(phonesArray)) {
            for (let key in phonesArray) {
                if (!phonesArray[key]) {
                    continue;
                }

                phones.push(phonesArray[key]);
            }
        } else {
            phones.push(req.body.phones);
        }

        let json = {
            id: uuidv1(),
            username: req.body.username,
            password: generatePassword(6, false, /\d/),
            name: req.body.name,
            job: {title: req.body.job, date: moment(req.body.job_date, "YYYY-MM-DD").toDate()},
            qualification: {
                title: req.body.qualification,
                date: moment(req.body.qualification_date, "YYYY-MM-DD").toDate()
            },
            birth: {date: moment(req.body.birthdate, "YYYY-MM-DD").toDate(), address: req.body.birthaddress},
            address: req.body.address,
            phones: phones,
            code: req.body.code,
            email: req.body.email,
            photo: req.body.photo,
            contract: req.body.contract === "on",
            receipt: {receipt: req.body.receipt === "on", value: req.body.receipt_value},
            // ids = projects ids ex.
            //roles:[{id:String , name:String , ids:[String]}]
        };

        let employee = new Employee(json);

        employee.save(function (err) {
            if (err) {
                logger.error("error while add new employee " + err);
                res.render('error', {title: "error while add a new employee", message: err});
            } else {
                res.render('employees/add-employee', {user: req.user, success: true});
            }

        });

    });
});

router.get('/edit', ensure.ensureAuthenticated("/admin/"), function (req, res) {

});

router.post('/processing/edit', ensure.ensureAuthenticated("/admin/"), function (req, res) {

});

router.get('/remove/:id', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "employees", function () {
        Employee.deleteOne({id: req.params.id}, function (err) {
            if (err) {
                logger.error("error while delete employee " + err);
                res.render("error", {message: err});
            } else {
                res.redirect('/admin/employees');
            }
        });
    });
});

router.get('/view/:id', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "employees", function () {
        Employee.findOne({id: req.params.id}, function (err, employee) {
            if (err) {
                logger.error("error while view employee " + err);
                res.render("error", {message: err});
            } else {
                res.render("employees/view-employee", {user: req.user, employee: employee});
            }
        });
    });
});

module.exports = router;