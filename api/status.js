const express = require('express');
const router = express.Router();
const Tools = require('../utils/tools');

// Define routes.
router.post('/get-employee-status', function (req, res) {
    Tools.checkAPIToken(req, res , function (employee) {
                if (employee) {
                    res.json({success: true, profile: employee});
                } else {
                    res.json({success: false, err: "no_profile"});
                }
        });
});

// Define routes.
router.post('/get-server-status', function (req, res) {
    //res.json({success: false, status: "stopped"});
    //res.json({success: false, status: "update"});
    res.json({success: true,});
});

module.exports = router;