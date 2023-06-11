const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const Todo = require('../models/todo');
const Tools = require('../utils/tools');

// Define routes.
router.post('/get-all', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Todo.find({
            employees: {$in: [employee.id]}
        }, function (err, todo) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (todo) {
                    res.json({success: true, todo: todo});
                } else {
                    res.json({success: false, err: "no_todo"});
                }
            }
        });
    });
});

router.post('/get-unread', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Todo.find({
            employees: {$in: [employee.id]},
            employees_read: {$nin: [{id: employee.id}]}
        }, function (err, todo) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (todo) {
                    res.json({success: true, todo: todo});
                } else {
                    res.json({success: false, err: "no_todo"});
                }
            }
        });
    });
});

router.post('/get-today', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Todo.find({
            employees: {$in: [employee.id]},
        }, function (err, todo) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (todo) {
                    res.json({success: true, todo: todo});
                } else {
                    res.json({success: false, err: "no_todo"});
                }
            }
        });
    });
});

router.post('/read', function (req, res) {
    let todoId = req.body.todo_id;
    Tools.checkAPIToken(req, res , function (employee) {
        Todo.update({id:todoId} , {$push : {employees_read : {id:employee.id , date : Date.now()}}} , function (err, todo) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (todo) {
                    res.json({success: true, todo: todo});
                } else {
                    res.json({success: false, err: "no_todo"});
                }
            }
        });
    });
});

router.post('/do', function (req, res) {
    let todoId = req.body.todo_id;
    Tools.checkAPIToken(req, res , function (employee) {
        Todo.update({id:todoId} , {$push : {employees_done : {id:employee.id , date : Date.now()}}} , function (err, todo) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (todo) {
                    res.json({success: true, todo: todo});
                } else {
                    res.json({success: false, err: "no_todo"});
                }
            }
        });
    });
});

module.exports = router;