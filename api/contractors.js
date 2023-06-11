const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const Contractor = require('../models/contractor');
const Tools = require('../utils/tools');

// Define routes.
router.post('/get-all', function (req, res) {
    Tools.checkAPIToken(req, res , function (employee) {
        Contractor.find({}, function (err, contractors) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (contractors) {
                    res.json({success: true, contractors: contractors});
                } else {
                    res.json({success: false, err: "no_contractors"});
                }
            }
        });
    });
});

router.post('/get-contractor/:id', function (req, res) {
    Tools.checkAPIToken(req, res , function (employee) {
        Contractor.findOne({id:req.params.id}, function (err, contractor) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (contractor) {
                    res.json({success: true, contractor: contractor});
                } else {
                    res.json({success: false, err: "no_contractor"});
                }
            }
        });
    });
});

module.exports = router;