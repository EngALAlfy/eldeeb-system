const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const Employee = require('../models/employee');
const Notification = require('../models/notification');
const Project = require('../models/project');
const Tools = require('../utils/tools');

const generatePassword = require('password-generator');
const fs = require('fs-extra');


// Define routes.
router.post('/get-all', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Employee.find({}, {
            id: 1,
            _id: 0,
            name: 1,
            username: 1,
            code: 1,
            job: 1,
            photo: 1,
            qualification: 1,
            birth: 1
        }, {sort: {name: 1}}, function (err, employees) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (employees) {
                    res.json({success: true, employees: employees});
                } else {
                    res.json({success: false, err: "no_employees"});
                }
            }
        });
    });
});

router.post('/get-employee/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Employee.findOne({id: req.params.id}, function (err, employee) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (employee) {
                    res.json({success: true, employee: employee});
                } else {
                    res.json({success: false, err: "no_employee"});
                }
            }
        });
    });
});

router.post('/get-profile', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        res.json({success: true, employee: employee});
    });
});


router.post('/change-profile-password', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        let password = req.body.password;
        Employee.updateOne({id: employee.id}, {$set: {password: password}}, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });
    });
});


router.get('/send-whatsapp', function (req, res) {
    let accountSid = 'ACf19ed250197b6034b3d1b2d600f56ad1';
    let authToken = 'f91634bb0a610de119affa7fdc6703e6';
    let client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
            from: '+15615718672',
            to: '+201098559403'
        }).then(function (message) {
        res.json({success: true});
    });

});


router.post('/get-employee-attendance/:id', function (req, res) {
    let project = req.body.project;
    let info = req.body.info;
    let taker = req.body.taker;

    let employeeInfo = {
        attendance: 1,
        salary: 1,
        paid_holidays: 1,
        _id: 0
    };

    if (info) {
        employeeInfo = {
            attendance: 1,
            salary: 1,
            salary_info: 1,
            paid_holidays: 1,
            _id: 0
        };
    }
    Tools.checkAPIToken(req, res, function (_employee) {
        Employee.findOne({id: req.params.id}, employeeInfo, {lean: true}, async function (err, employee) {
            console.log(err);
            console.log(employee);
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (employee && employee.attendance) {

                    for (let i = 0; i < employee.attendance.length; i++) {
                        if (project) {
                            if (employee.attendance[i].project != project) {
                                employee.attendance.splice(i, 1);
                            }
                        } else {
                            let projectName = (await Project.findOne({id: employee.attendance[i].project}, {name: 1})).name;
                            employee.attendance[i].name = projectName;


                        }

                       if(taker){
                           let takerName = (await Employee.findOne({id: employee.attendance[i].taker_id}, {name: 1})).name;
                           employee.attendance[i].taker = takerName;
                       }
                    }


                    if (!employee.salary_info) {
                        employee.salary_info = [];
                    }

                    res.json({success: true, employee: employee});
                } else {
                    res.json({success: false, err: "no_employee_attendance"});
                }
            }
        });
    });
});

router.post('/get-employee-salary-info/:id', function (req, res) {

    Tools.checkAPIToken(req, res, function (_employee) {
        Employee.findOne({id: req.params.id}, {
            salary: 1,
            salary_info: 1,
            insurance:1,
            _id: 0
        }, {lean: true}, async function (err, employee) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (employee && employee.salary_info) {
                    res.json({success: true, employee: employee});
                } else {
                    res.json({success: false, err: "no_employee_salary_info"});
                }
            }
        });
    });
});

router.post('/save-employee-salary-info/:id', function (req, res) {

    let salary = req.body.salary;
    let month_days = req.body.month_days;
    let fridays = req.body.fridays;
    let formal_holidays = req.body.formal_holidays;
    let paid_holidays = req.body.paid_holidays;
    let work_days = req.body.work_days;
    let attend_days = req.body.attend_days;
    let absence_days = req.body.absence_days;
    let attendance_salary = req.body.attendance_salary;
    let borrows = req.body.borrows;
    let discounts = req.body.discounts;
    let additions = req.body.additions;
    let rewards = req.body.rewards;
    let final_salary = req.body.final_salary;

    Tools.checkAPIToken(req, res, function (_employee) {
        Employee.findOne({id: req.params.id}, {
            salary_info: 1,

            _id: 0
        }, {lean: true}, async function (err, employee) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (employee) {

                    if (employee.salary_info) {
                        for (let i = 0; i < employee.salary_info.length; i++) {
                            let _info = employee.salary_info[i];

                            if (_info.year == new Date().getFullYear() && _info.month == new Date().getMonth()) {
                                employee.salary_info.splice(i, 1);
                            }
                        }
                    } else {
                        employee.salary_info = [];
                    }

                    let info = {
                        month: new Date().getMonth(),
                        year: new Date().getFullYear(),

                        salary: salary,

                        month_days: month_days,
                        fridays: fridays,

                        formal_holidays: formal_holidays,
                        paid_holidays: paid_holidays,
                        work_days: work_days,

                        attend_days: attend_days,
                        absence_days: absence_days,

                        attendance_salary: attendance_salary,

                        borrows: borrows,
                        discounts: discounts,
                        additions: additions,
                        rewards: rewards,

                        final_salary: final_salary,
                    };

                    employee.salary_info.push(info);

                    Employee.updateOne({id: req.params.id}, {
                        $set: {
                            salary_info: employee.salary_info,
                        }
                    }, function (err) {
                        if (err) {
                            res.json({success: false, err: err});
                        } else {

                            let title = "تفاصيل الراتب";
                            let message = "راتب شهر "+ info.month + "\n";
                            let employees = [req.params.id];

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
                        }
                    });

                } else {
                    res.json({success: false, err: "no_employee"});
                }
            }
        });
    });
});

router.post('/add-paid-holidays/:id', function (req, res) {

    let holidays = req.body.holidays;

    Tools.checkAPIToken(req, res, function (_employee) {
        Employee.updateOne({id: req.params.id}, {
            $set: {
                paid_holidays: holidays,
            }
        }, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });
    });
});

router.post('/get-employee-roles/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (_employee) {
        Employee.findOne({id: req.params.id}, {roles: 1, _id: 0}, function (err, employee) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (employee && employee.roles) {
                    res.json({success: true, employee: employee.roles});
                } else {
                    res.json({success: false, err: "no_employee_attendance"});
                }
            }
        });
    });
});

router.post('/add-employee-attendance/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (_employee) {

        let isAttend = req.body.attendance;
        let notes = req.body.notes;
        let date = req.body.date;
        let month = req.body.month;
        let day = req.body.day;
        let year = req.body.year;
        let project_id = req.body.project;
        let exists_in_project = false;

        Employee.findOne({id: req.params.id}, function (err, employee) {
            if (err) {
                res.json({success: false, err: "while check dates \n err:" + err});
            } else {
                if (employee) {

                    if (employee.attendance && employee.attendance.length > 0) {

                        for (let i = 0; i < employee.attendance.length; i++) {
                            if (employee.attendance[i].project == project_id) {
                                if (employee.attendance[i].day == day && employee.attendance[i].month == month && employee.attendance[i].year == year) {
                                    employee.attendance.splice(i, 1);
                                }
                            } else {
                                if (employee.attendance[i].day == day && employee.attendance[i].month == month && employee.attendance[i].year == year) {
                                    exists_in_project = true;
                                }
                            }
                        }
                    }

                    if (exists_in_project) {
                        res.json({success: false, err: "exist_in_another_project"});
                        return;
                    }

                    let attend = {
                        project: project_id,
                        attendance: isAttend,
                        date: date,
                        day: day,
                        month: month,
                        year: year,
                        notes: notes,
                        taker_id: _employee.id,
                    };

                    employee.attendance.push(attend);

                    Employee.updateOne({id: req.params.id}, {
                        $set: {
                            attendance: employee.attendance,
                        }
                    }, function (err) {
                        if (err) {
                            res.json({success: false, err: err});
                        } else {
                            res.json({success: true});
                        }
                    });


                } else {
                    res.json({success: false, err: "no_employee"});
                }
            }

        });
    });
});

router.post('/add-employee-salary/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let salary = req.body.salary;

        Employee.updateOne({id: req.params.id}, {
            $set: {
                salary: salary,
            },
        }, function (err) {

            if (err) {
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });
    });
});

router.post('/add-employee-insurance/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let insurance = req.body.insurance;

        Employee.updateOne({id: req.params.id}, {
            $set: {
                insurance: insurance,
            },
        }, function (err) {

            if (err) {
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });
    });
});


router.post('/add-employee-code/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let code = req.body.code;

        Employee.updateOne({id: req.params.id}, {
            $set: {
                code: code,
            },
        }, function (err) {

            if (err) {
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });
    });
});


router.post('/add-employee-roles/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let roles = req.body.roles.split(",").map(function (val) {
            return {name: val};
        });

        Employee.updateOne({id: req.params.id}, {
            $set: {
                roles: roles,
            },
        }, function (err) {

            if (err) {
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });
    });
});


router.post('/update-employee/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let phones;

        if(req.body.phones) {
            phones = req.body.phones.split(",");
        }


        Employee.updateOne({id: req.params.id},
            {
                $set: {
                    name: req.body.name,
                    job: {title: req.body.job, date: req.body.job_date},
                    qualification: {
                        title: req.body.qualification,
                        date: req.body.qualification_date
                    },
                    birth: {date: req.body.birthdate, address: req.body.birthaddress},
                    address: req.body.address,
                    phones: phones,
                    code: req.body.code,
                    email: req.body.email,
                    contract: req.body.contract,
                    receipt: {receipt: req.body.receipt, value: req.body.receipt_value},
                }
            }
            , function (err) {
                if (err) {
                    res.json({success: false, err: err});
                } else {
                    res.json({success: true});
                }
            });

    });
});


router.post('/add-new-employee', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let base64 = req.body.photo;
        let type = req.body.photo_ext;

        let phones = req.body.phones.split(",");


        let username = req.body.username;

        Employee.find({username: username}, function (err, employees) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (employees && employees.length > 0) {
                    res.json({success: false, err: "username_exists"});
                } else {
                    if (base64) {
                        let filename = uuidv1() + "." + type;

                        let path = __dirname + "/../public/profiles-files/" + filename;

                        fs.outputFile(path, base64, {encoding: 'base64'}, function (err) {
                            if (err) {
                                res.json({success: false, err: err});
                            } else {

                                let json = {
                                    id: uuidv1(),
                                    username: req.body.username,
                                    password: generatePassword(6, false, /\d/),
                                    name: req.body.name,
                                    job: {title: req.body.job, date: req.body.job_date},
                                    qualification: {
                                        title: req.body.qualification,
                                        date: req.body.qualification_date
                                    },
                                    birth: {date: req.body.birthdate, address: req.body.birthaddress},
                                    address: req.body.address,
                                    phones: phones,
                                    salary: req.body.salary,
                                    code: req.body.code,
                                    email: req.body.email,
                                    paid_holidays: req.body.paid_holidays,
                                    photo: filename,
                                    contract: req.body.contract,
                                    receipt: {receipt: req.body.receipt, value: req.body.receipt_value},
                                    // ids = projects ids ex.
                                    roles: [{name: "view-project"}, {name: "view-employee"}, {name: "view-notification"}, {name: "view-todo"}]
                                };

                                let employee = new Employee(json);


                                employee.save(function (err) {
                                    if (err) {
                                        res.json({success: false, err: err});
                                    } else {
                                        res.json({success: true});
                                    }
                                });

                            }
                        });

                    } else {

                        let json = {
                            id: uuidv1(),
                            username: req.body.username,
                            password: generatePassword(6, false, /\d/),
                            name: req.body.name,
                            job: {title: req.body.job, date: req.body.job_date},
                            qualification: {
                                title: req.body.qualification,
                                date: req.body.qualification_date
                            },
                            birth: {date: req.body.birthdate, address: req.body.birthaddress},
                            address: req.body.address,
                            phones: phones,
                            code: req.body.code,
                            email: req.body.email,
                            paid_holidays: req.body.paid_holidays,
                            contract: req.body.contract,
                            receipt: {receipt: req.body.receipt, value: req.body.receipt_value},
                            // ids = projects ids ex.
                            roles: [{name: "view-project"}, {name: "view-employee"}, {name: "view-notification"}, {name: "view-todo"}]
                        };

                        let employee = new Employee(json);


                        employee.save(function (err) {

                            if (err) {
                                res.json({success: false, err: err});
                            } else {
                                res.json({success: true});
                            }
                        });

                    }

                }
            }
        });


    });
});

router.post('/update-employee-photo/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let base64 = req.body.photo;
        let type = req.body.photo_ext;

        let filename = uuidv1() + "." + type;

        let path = __dirname + "/../public/profiles-files/" + filename;

        fs.outputFile(path, base64, {encoding: 'base64'}, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                Employee.updateOne({id: req.params.id}, {$set: {photo: filename}}, function (err, employees) {
                    if (err) {
                        res.json({success: false, err: err});
                    } else {
                        res.json({success: true});
                    }
                });

            }
        });

    });
});

router.post('/delete-employee/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Employee.deleteOne({id: req.params.id}, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });
    });
});


module.exports = router;