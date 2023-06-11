const express = require('express');
const router = express.Router();
const passport = require('passport');
const ensure = require('connect-ensure-login');
const uuidv1 = require('uuid/v1');
const generatePassword = require('password-generator');

const logger = require('../utils/error-logger.js');
const tools = require('../utils/tools.js');
const moment = require('moment');
const Contractor = require('../models/contractor');

router.use(passport.initialize());
router.use(passport.session());


// contractors
router.get('/',
    ensure.ensureAuthenticated("/admin/login"),
    function (req, res) {
        tools.checkRole(req, res, "contractors", function () {
            Contractor.find({}, function (err, contractors) {
                if (err) {
                    logger.error("error while get contractors " + err);
                    res.render('contractors/contractors', {error: err});
                    return;
                }
                res.render('contractors/contractors', {user: req.user, contractors: contractors});
            });
        });

    });


router.get('/add', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "add-contractor", function () {
        res.render('contractors/add-contractor', {user: req.user});
    });
});

router.post('/processing/add', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "add-contractor", function () {

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

        let contractor = new Contractor(json);

        contractor.save(function (err) {
            if (err) {
                logger.error("error while add new contractor " + err);
                res.render('error', {title: "error while add a new contractor", message: err});
            } else {
                res.render('contractors/add-contractor', {user: req.user, success: true});
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
    tools.checkRole(req, res, "contractors", function () {
        Contractor.findOne({id: req.params.id}, function (err, contractor) {
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