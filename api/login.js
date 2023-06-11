const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const Employee = require('../models/employee');

// Define routes.
router.post('/username', function (req, res) {
    let username = String(req.body.username).trim();
    let password = String(req.body.password);

    Employee.findOne({username: username, password: password}, {
        name: 1,
        username: 1,
        password: 1,
        token: 1,
        id: 1,
        roles: 1,
        photo: 1
    }, function (err, employee) {
        if (err) {
            res.json({success: false, err: err});
        } else {
            if (employee) {
                if (username == employee.username && password == employee.password) {
                    employee.token = uuidv1();
                    // employee.attendance = [];
                    employee.save(function (err) {
                        if (err) {
                            res.json({success: false, err: err});
                        } else {
                            res.json({
                                success: true,
                                name: employee.name,
                                photo: employee.photo,
                                token: employee.token,
                                roles: employee.roles
                            });
                        }
                    });
                } else {
                    res.json({success: false, err: "user_or_password_false"});
                }
            } else {
                res.json({success: false, err: "false_user_or_password"});
            }
        }
    });
});

router.post('/token', function (req, res) {
    let token = String(req.body.token);

    Employee.findOne({token: token}, {name: 1, token: 1, id: 1, roles: 1, photo: 1}, function (err, employee) {
        if (err) {
            res.json({success: false, err: err});
        } else {
            if (employee) {
                if (token == employee.token) {
                    res.json({success: true, name: employee.name, photo: employee.photo, roles: employee.roles});
                } else {
                    res.json({success: false, err: "token_invalid"});
                }
            } else {
                res.json({success: false, err: "invalid_token"});
            }
        }
    });
});


module.exports = router;