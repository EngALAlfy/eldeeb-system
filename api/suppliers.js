const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const Supplier = require('../models/supplier');
const Tools = require('../utils/tools');

// Define routes.
router.post('/get-all', function (req, res) {
    Tools.checkAPIToken(req, res , function (employee) {
        Supplier.find({}, function (err, suppliers) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (suppliers) {
                    res.json({success: true, suppliers: suppliers});
                } else {
                    res.json({success: false, err: "no_suppliers"});
                }
            }
        });
    });
});

router.post('/get-supplier/:id', function (req, res) {
    Tools.checkAPIToken(req, res , function (employee) {
        Supplier.findOne({id:req.params.id}, function (err, supplier) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (supplier) {
                    res.json({success: true, supplier: supplier});
                } else {
                    res.json({success: false, err: "no_supplier"});
                }
            }
        });
    });
});


module.exports = router;