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


// suppliers
router.get('/',
    ensure.ensureAuthenticated("/admin/login"),
    function (req, res) {
        tools.checkRole(req, res, "suppliers", function () {
            Supplier.find({}, function (err, suppliers) {
                if (err) {
                    logger.error("error while get suppliers " + err);
                    res.render('suppliers/suppliers', {error: err});
                    return;
                }
                res.render('suppliers/suppliers', {user: req.user, suppliers: suppliers});
            });
        });

    });


router.get('/add', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "add-supplier", function () {
        res.render('suppliers/add-supplier', {user: req.user});
    });
});

router.post('/processing/add', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "add-supplier", function () {

        let phones = [];
        let items = [];

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


        if (req.body.items) {
            if (Array.isArray(req.body.items)) {
                req.body.items.forEach(function (val) {
                    items.push(val);
                });
            } else {
                items.push(req.body.items);
            }
        }

        let json = {
            id: uuidv1(),
            name: req.body.name,
            field: req.body.field,
            contract: req.body.contract === "on",
            contract_image: req.body.contract_image,
            contract_completion: req.body.contract_completion === "on",
            items: items,
            phones: phones,
        };

        let supplier = new Supplier(json);

        supplier.save(function (err) {
            if (err) {
                logger.error("error while add new supplier " + err);
                res.render('error', {title: "error while add a new supplier", message: err});
            } else {
                res.render('suppliers/add-supplier', {user: req.user, success: true});
            }

        });

    });
});

router.get('/edit', ensure.ensureAuthenticated("/admin/"), function (req, res) {

});

router.post('/processing/edit', ensure.ensureAuthenticated("/admin/"), function (req, res) {

});

router.get('/remove/:id', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "suppliers", function () {
        Supplier.deleteOne({id: req.params.id}, function (err) {
            if (err) {
                logger.error("error while delete supplier " + err);
                res.render("error", {message: err});
            } else {
                res.redirect('/admin/suppliers');
            }
        });
    });
});

router.get('/view/:id', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "suppliers", function () {
        Supplier.findOne({id: req.params.id}, function (err, supplier) {
            if (err) {
                logger.error("error while view supplier " + err);
                res.render("error", {message: err});
            } else {
                res.render("suppliers/view-supplier", {user: req.user, supplier: supplier});
            }
        });
    });
});

module.exports = router;