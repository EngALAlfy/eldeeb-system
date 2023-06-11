const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const Notification = require('../models/notification');
const Tools = require('../utils/tools');

// Define routes.
router.post('/get-all', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Notification.find({employees: {$in: [employee.id]}}, {}, {sort: {createdAt: -1}}, function (err, notifications) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (notifications) {
                    res.json({success: true, notifications: notifications , id:employee.id});
                } else {
                    res.json({success: false, err: "no_notifications"});
                }
            }
        });
    });
});

router.post('/get-all-notifications', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Notification.find({}, {}, {sort: {createdAt: -1}}, function (err, notifications) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (notifications) {
                    res.json({success: true, notifications: notifications , id:employee.id});
                } else {
                    res.json({success: false, err: "no_notifications"});
                }
            }
        });
    });
});

router.post('/get-unread', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Notification.find({
                employees: {$in: [employee.id]},
            }
            , {}, {sort: {createdAt: -1}}
            , function (err, notifications) {
                if (err) {
                    res.json({success: false, err: err});
                } else {
                    if (notifications && notifications.length > 0) {

                        let _notifications = Object.assign([], notifications);

                        for (let i = 0; i < notifications.length; i++) {
                            if (notifications[i].employees_read.length > 0) {
                                for (let o = 0; o < notifications[i].employees_read.length; o++) {
                                    if (notifications[i].employees_read[o].id == employee.id) {
                                        _notifications.splice(i, 1);
                                    }
                                }
                            }


                        }


                        res.json({success: true, notifications: _notifications});
                    } else {
                        res.json({success: false, err: "no_notifications"});
                    }
                }
            });
    });
});

router.post('/read', function (req, res) {
    let notificationsIds = req.body.notifications_ids.replace("[", "").replace("]", "").split(",");

    Tools.checkAPIToken(req, res, function (employee) {
        Notification.find({id: {$in: notificationsIds}}, function (err, notifications) {
            if (err) {
                res.json({success: false, err: err});
            } else {

                if (notifications) {
                    let notificationsIdsUpdate = [];
                    for (let i = 0; i < notifications.length; i++) {

                        if (notifications[i].employees_read.length > 0) {
                            for (let o = 0; o < notifications[i].employees_read.length; o++) {
                                if (notifications[i].employees_read[o].id != employee.id) {
                                    notificationsIdsUpdate.push(notifications[i].id);
                                }
                            }
                        } else {
                            notificationsIdsUpdate.push(notifications[i].id);
                        }

                    }

                    Notification.updateMany({id: {$in: notificationsIdsUpdate}}, {
                        $push: {
                            employees_read: {
                                id: employee.id,
                                date: Date.now()
                            }
                        }
                    }, function (err, result) {
                        if (err) {
                            res.json({success: false, err: err});
                        } else {
                            console.log(result.n);
                            console.log(result.nModified);
                            res.json({success: true});
                        }
                    });

                } else {
                    res.json({success: false, err: "empty"});
                }

            }
        });
    });
});


router.post('/add-new-notification', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let title = req.body.title;
        let message = req.body.message;
        let employees = req.body.employees.split(",");

            let json = {
                id: uuidv1(),
                title: title,
                message: message,
                employees: employees,

            };

            let notification = new Notification(json);


        notification.save(function (err) {

                if (err) {
                    res.json({success: false, err: err});
                } else {
                    res.json({success: true});
                }
            });


    });
});


router.post('/delete-notification/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Notification.deleteOne({id: req.params.id},  function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });
    });
});


module.exports = router;