const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const Employee = require('../models/employee');

// Define routes.
router.get('/' ,
    function (req, res) {
        res.redirect("/admin/");
    });

module.exports = router;