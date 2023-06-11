const express = require('express');
const router = express.Router();
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const ensure = require('connect-ensure-login');
const uuidv1 = require('uuid/v1');
const logger = require('../utils/error-logger.js');
const tools = require('../utils/tools.js');



// Define routes.
router.get('/', ensure.ensureAuthenticated("/admin/login"),
    function (req, res) {
        res.redirect("/admin/");
});

module.exports = router;