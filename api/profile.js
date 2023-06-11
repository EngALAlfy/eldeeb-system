const express = require('express');
const router = express.Router();
const Tools = require('../utils/tools');

// Define routes.
router.post('/get-profile', function (req, res) {
    Tools.checkAPIToken(req, res , function (employee) {
                if (employee) {
                    res.json({success: true, profile: employee});
                } else {
                    res.json({success: false, err: "no_profile"});
                }
        });
});

module.exports = router;