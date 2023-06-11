const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const fs = require('fs-extra');
const Employee = require('../models/employee');
const Project = require('../models/project');
const Supplier = require('../models/supplier');
const Contractor = require('../models/contractor');
const Tools = require('../utils/tools');


router.post('/get-all', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let obj = {};

        let role = false;

        for (let i = 0; i < employee.roles.length; i++) {
            if (employee.roles[i].name == "view-all-projects") {
                role = true;
            }
        }


        if (!role) {
            obj = {
                employees: employee.id,
            };
        }

        Project.find(obj, {
            name: 1,
            owner: 1,
            receive_date: 1,
            duration: 1,
            contract_value: 1,
            id: 1,
            _id: 0
        }, {sort: {createdAt: -1}}, function (err, projects) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (projects) {
                    res.json({success: true, projects: projects});
                } else {
                    res.json({success: false, err: "no_projects"});
                }
            }
        });
    });
});

router.post('/get-employee-projects', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        let id = req.body.id;

        Project.find({
            employees: id,
        }, {
            name: 1,
            owner: 1,
            receive_date: 1,
            duration: 1,
            contract_value: 1,
            id: 1,
            _id: 0
        }, {sort: {createdAt: -1}}, function (err, projects) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (projects) {
                    res.json({success: true, projects: projects});
                } else {
                    res.json({success: false, err: "no_projects"});
                }
            }
        });
    });
});

router.post('/get-info/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.findOne({id: req.params.id},
            {
                owner: 1,
                code: 1,
                consultant: 1,
                contract_value: 1,
                conclusion_value: 1,
                expected_conclusion: 1,
                contract_code: 1,
                receive_date: 1,
                duration: 1,
                dead_line: 1,
                general_contractor: 1,
                //
                items: 1,
                exist_items: 1,
                new_items: 1,
                //
                location: 1,
                name: 1,
                id: 1,
                _id: 0
            }
            , function (err, project) {
                if (err) {
                    res.json({success: false, err: err});
                } else {
                    if (project) {
                        res.json({success: true, project: project});
                    } else {
                        res.json({success: false, err: "no_project_info"});
                    }
                }
            });
    });
});

router.post('/get-unsolved-problems/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.findOne({id: req.params.id,}, {
            problems: 1,
            id: 1,
            _id: 0
        }, async function (err, project) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (project) {
                    if (project.problems) {
                        project.problems.sort(compare);

                        let errors = [];
                        let problems = [];

                        for (let i = 0; i < project.problems.length; i++) {
                            let problem = project.problems[i];
                            if (!problem.solved) {
                                try {
                                    let employee = await Employee.findOne({id: problem.employee_id}, {
                                        id: 1,
                                        name: 1,
                                        photo: 1,
                                        _id: 0,
                                        job: 1
                                    });
                                    if (employee) {
                                        let _problem = JSON.parse(JSON.stringify(problem));
                                        _problem.employee = employee;
                                        problems.push(_problem);
                                    } else {
                                        errors.push({id: problem.employee_id, err: "no_problem_employee"});
                                    }
                                } catch (err) {
                                    errors.push({id: problem.employee_id, err: err});
                                }
                            }
                        }

                        res.json({success: true, problems: problems});
                    } else {
                        res.json({success: false, err: "no_project_problems"});
                    }


                } else {
                    res.json({success: false, err: "no_project"});
                }
            }
        });
    });
});

router.post('/get-solved-problems/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.findOne({id: req.params.id,}, {
            problems: 1,
            id: 1,
            _id: 0
        }, async function (err, project) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (project) {
                    if (project.problems) {
                        project.problems.sort(compare);

                        let errors = [];
                        let problems = [];

                        for (let i = 0; i < project.problems.length; i++) {
                            let problem = project.problems[i];
                            if (problem.solved) {
                                try {
                                    let employee = await Employee.findOne({id: problem.employee_id}, {
                                        id: 1,
                                        name: 1,
                                        photo: 1,
                                        _id: 0,
                                        job: 1
                                    });
                                    if (employee) {
                                        let _problem = JSON.parse(JSON.stringify(problem));
                                        _problem.employee = employee;
                                        problems.push(_problem);
                                    } else {
                                        errors.push({id: problem.employee_id, err: "no_problem_employee"});
                                    }
                                } catch (err) {
                                    errors.push({id: problem.employee_id, err: err});
                                }
                            }
                        }

                        res.json({success: true, problems: problems});
                    } else {
                        res.json({success: false, err: "no_project_problems"});
                    }


                } else {
                    res.json({success: false, err: "no_project"});
                }
            }
        });
    });
});

router.post('/add-problem/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let title = req.body.title;
        let des = req.body.des;

        Project.updateOne({id: req.params.id}, {
            $push: {
                problems: {
                    id: uuidv1(),
                    title: title,
                    des: des,
                    date: Date.now(),
                    employee_id: employee.id,
                    solved: false
                }
            }
        }, function (err) {
            if (err) {
                console.log(err);
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });
    });
});

router.post('/solve-problem/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let problem = req.body.problem;

        Project.updateOne({id: req.params.id, 'problems.id': problem}, {
            $set: {
                'problems.$.solved': true,
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

router.post('/add-field-photo/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let base64 = req.body.photo;
        let type = req.body.ext;
        let title = req.body.title;

        let filename = uuidv1() + "." + type;

        let path = __dirname + "/../public/projects-files/" + req.params.id + "/" + filename;

        fs.outputFile(path, base64, {encoding: 'base64'}, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                Project.updateOne({id: req.params.id}, {
                    $push: {
                        field_photos: {
                            url: filename,
                            title: title,
                            date: Date.now(),
                            employee_id: employee.id,
                        }
                    }
                }, function (err) {
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

router.post('/add-project-progress/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let progress = req.body.progress;
        let key = req.body.key;

        Project.updateOne({id: req.params.id}, {
            $push: {
                project_progress: {
                    key: key,
                    progress: progress,
                    date: Date.now(),
                    employee_id: employee.id,
                }
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

router.post('/add-other-file/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let base64 = req.body.file;
        let type = req.body.ext;
        let key = req.body.key;

        let filename = uuidv1() + "." + type;

        let path = __dirname + "/../public/projects-files/" + req.params.id + "/" + filename;

        fs.outputFile(path, base64, {encoding: 'base64'}, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                Project.updateOne({id: req.params.id}, {
                    $push: {
                        other_files: {
                            key: key,
                            url: filename,
                            date: Date.now(),
                            employee_id: employee.id,
                        }
                    }
                }, function (err) {
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

router.post('/add-drawing-file/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let base64 = req.body.file;
        let type = req.body.ext;
        let key = req.body.key;

        let filename = uuidv1() + "." + type;

        let path = __dirname + "/../public/projects-files/" + req.params.id + "/" + filename;

        fs.outputFile(path, base64, {encoding: 'base64'}, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                Project.updateOne({id: req.params.id}, {
                    $push: {
                        drawings: {
                            key: key,
                            url: filename,
                            date: Date.now(),
                            employee_id: employee.id,
                        }
                    }
                }, function (err) {
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

router.post('/add-extract-file/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let base64 = req.body.file;
        let type = req.body.ext;
        let key = req.body.key;

        let filename = uuidv1() + "." + type;

        let path = __dirname + "/../public/projects-files/" + req.params.id + "/" + filename;

        fs.outputFile(path, base64, {encoding: 'base64'}, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                Project.updateOne({id: req.params.id}, {
                    $push: {
                        extracts: {
                            key: key,
                            url: filename,
                            date: Date.now(),
                            employee_id: employee.id,
                        }
                    }
                }, function (err) {
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


router.post('/update-problem/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let title = req.body.title;
        let des = req.body.des;
        let id = req.body.id;

        Project.updateOne({id: req.params.id, "problems.id": id}, {
            $set: {
                "problems.$.title": title,
                "problems.$.des": des,
            }
        }, function (err) {
            if (err) {
                console.log(err);
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });
    });
});

router.post('/update-project-progress/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let progress = req.body.progress;
        let key = req.body.key;

        Project.updateOne({id: req.params.id, "project_progress.key": key}, {
            $set: {
                "project_progress.$.progress": progress
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

router.post('/update-field-photo/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let url = req.body.photo;
        let title = req.body.title;


        Project.updateOne({id: req.params.id, "field_photos.url": url}, {
            $set: {
                "field_photos.$.title": title
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


router.post('/add-manager/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let id = req.body.id;

        Project.updateOne({id: req.params.id}, {
            $set: {
                manager: id,
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

router.post('/add-project-employee/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let id = req.body.id;
        let move = req.body.move;

        Project.find({employees: id}, {id: 1, name: 1}, {lean: true}, function (err, projects) {
            if (projects && projects.length) {
                console.log(1);
                if (move) {
                    let ids = [];
                    for (let i = 0; i < projects.length; i++) {
                        ids.push(projects[i].id);
                    }

                    Project.updateMany({id: {$in: ids}}, {$pull: {employees: id}}, function (err) {
                        if (err) {
                            res.json({success: false, err: err});
                        } else {
                            Project.updateOne({id: req.params.id}, {
                                $push: {
                                    employees: id,
                                }
                            }, function (err) {
                                if (err) {
                                    res.json({success: false, err: err});
                                } else {
                                    res.json({success: true});
                                }
                            });
                        }
                    })
                } else {
                    res.json({
                        success: false,
                        err: "exists_in_projects",
                        projects: projects,
                        project_id: req.params.id,
                        employee: id
                    });
                }
            } else {
                console.log(req.params.id);
                console.log(id);
                Project.updateOne({id: req.params.id}, {
                    $push: {
                        employees: id,
                    }
                }, function (err) {
                    console.log(3);
                    console.log(err);
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

router.post('/add-contractor/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let id = req.body.id;

        Project.updateOne({id: req.params.id}, {
            $push: {
                contractors: id,
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

router.post('/add-supplier/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let id = req.body.id;

        Project.updateOne({id: req.params.id}, {
            $push: {
                suppliers: id,
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

router.post('/add-workers-count/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let count = req.body.count;
        let day = req.body.day;
        let month = req.body.month;
        let year = req.body.year;

        Project.findOne({id: req.params.id}, {workers_count: 1}, {lean: true}, function (err, project) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (project) {
                    if (project.workers_count && project.workers_count.length > 0) {
                        for (let i = 0; i < project.workers_count.length; i++) {
                            if (project.workers_count[i].day == day && project.workers_count[i].month == month && project.workers_count[i].year == year) {
                                project.workers_count.splice(i, 1);
                            }
                        }
                    }

                    project.workers_count.push({
                        count: count,
                        day: day,
                        month: month,
                        year: year,
                        date: Date.now(),
                    });

                    Project.updateOne({id: req.params.id}, {
                        $set: {
                            workers_count: project.workers_count
                        }
                    }, function (err) {
                        if (err) {
                            res.json({success: false, err: err});
                        } else {
                            res.json({success: true});
                        }
                    });
                } else {
                    res.json({success: false, err: "no_project"});
                }
            }
        });


    });
});

router.post('/delete-project-progress/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let progress = req.body.progress;
        let key = req.body.key;

        Project.updateOne({id: req.params.id}, {
            $pull: {
                project_progress: {
                    key: key,
                    progress: progress,
                    //employee_id: employee.id,
                }
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

router.post('/delete-other-file/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        let key = req.body.key;

        let filename = req.body.file;

        let path = __dirname + "/../public/projects-files/" + req.params.id + "/" + filename;

        Project.updateOne({id: req.params.id}, {
            $pull: {
                other_files: {
                    key: key,
                    url: filename,
                    //employee_id: employee.id,
                }
            }
        }, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                fs.remove(path, function (err) {

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

router.post('/delete-drawing-file/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        let key = req.body.key;

        let filename = req.body.file;

        let path = __dirname + "/../public/projects-files/" + req.params.id + "/" + filename;

        Project.updateOne({id: req.params.id}, {
            $pull: {
                drawings: {
                    key: key,
                    url: filename,
                    //employee_id: employee.id,
                }
            }
        }, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                fs.remove(path, function (err) {

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

router.post('/delete-extract-file/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        let key = req.body.key;

        let filename = req.body.file;

        let path = __dirname + "/../public/projects-files/" + req.params.id + "/" + filename;

        Project.updateOne({id: req.params.id}, {
            $pull: {
                extracts: {
                    key: key,
                    url: filename,
                    //employee_id: employee.id,
                }
            }
        }, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                fs.remove(path, function (err) {

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


router.post('/delete-project-employee/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let id = req.body.id;

        Project.updateOne({id: req.params.id}, {
            $pull: {
                employees: id,
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

router.post('/delete-contractor/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let id = req.body.id;

        Project.updateOne({id: req.params.id}, {
            $pull: {
                contractors: id,
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
router.post('/delete-supplier/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let id = req.body.id;

        Project.updateOne({id: req.params.id}, {
            $pull: {
                suppliers: id,
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


router.post('/delete-problem/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {

        let title = req.body.title;
        let des = req.body.des;
        let id = req.body.id;

        Project.updateOne({id: req.params.id}, {
            $pull: {
                problems: {
                    id: id,
                    title: title,
                    des: des,
                    //employee_id: employee.id,
                }
            }
        }, function (err) {
            if (err) {
                console.log(err);
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });
    });
});

router.post('/delete-field-photo/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        let filename = req.body.photo;

        let path = __dirname + "/../public/projects-files/" + req.params.id + "/" + filename;

        Project.updateOne({id: req.params.id}, {
            $pull: {
                field_photos: {
                    url: filename,
                    //employee_id: employee.id,
                }
            }
        }, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                fs.remove(path, function (err) {

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


router.post('/get-other-files/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.findOne({id: req.params.id}, {
            other_files: 1,
            id: 1,
            _id: 0
        }, {lean: true}, async function (err, project) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (project) {
                    if (project.other_files) {


                        project.other_files.sort(compare);


                        let errors = [];

                        for (let i = 0; i < project.other_files.length; i++) {
                            let file = project.other_files[i];
                            try {
                                let employee = await Employee.findOne({id: file.employee_id}, {
                                    id: 1,
                                    name: 1,
                                    photo: 1,
                                    _id: 0,
                                    job: 1
                                });
                                if (employee) {
                                    project.other_files[i].employee = employee;
                                } else {
                                    errors.push({id: file.employee_id, err: "no_file_employee"});
                                }
                            } catch (err) {
                                if (err) {
                                    errors.push({id: file.employee_id, err: err});
                                }
                            }
                        }

                        res.json({success: true, project: project.other_files, errs: errors});
                    } else {
                        res.json({success: false, err: "no_project_other_files"});
                    }
                } else {
                    res.json({success: false, err: "no_project"});
                }
            }
        });
    });
});

router.post('/get-drawings-files/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.findOne({id: req.params.id}, {drawings: 1, id: 1, _id: 0}, {lean: true}, async function (err, project) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (project) {
                    if (project.drawings) {

                        project.drawings.sort(compare);

                        let errors = [];

                        for (let i = 0; i < project.drawings.length; i++) {
                            let drawing = project.drawings[i];
                            try {
                                let employee = await Employee.findOne({id: drawing.employee_id}, {
                                    id: 1,
                                    name: 1,
                                    photo: 1,
                                    _id: 0,
                                    job: 1
                                });
                                if (employee) {
                                    project.drawings[i].employee = employee;
                                } else {
                                    errors.push({id: drawing.employee_id, err: "no_drawing_employee"});
                                }
                            } catch (err) {
                                if (err) {
                                    errors.push({id: drawing.employee_id, err: err});
                                }
                            }
                        }

                        res.json({success: true, project: project.drawings, errs: errors});
                    } else {
                        res.json({success: false, err: "no_project_drawings"});
                    }
                } else {
                    res.json({success: false, err: "no_project"});
                }
            }
        });
    });
});

router.post('/get-extracts-files/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.findOne({id: req.params.id}, {extracts: 1, id: 1, _id: 0}, {lean: true}, async function (err, project) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (project) {
                    if (project.extracts) {


                        project.extracts.sort(compare);


                        let errors = [];

                        for (let i = 0; i < project.extracts.length; i++) {
                            let extract = project.extracts[i];
                            try {
                                let employee = await Employee.findOne({id: extract.employee_id}, {
                                    id: 1,
                                    name: 1,
                                    photo: 1,
                                    _id: 0,
                                    job: 1
                                });
                                if (employee) {
                                    project.extracts[i].employee = employee;
                                } else {
                                    errors.push({id: extract.employee_id, err: "no_extract_employee"});
                                }
                            } catch (err) {
                                if (err) {
                                    errors.push({id: extract.employee_id, err: err});
                                }
                            }
                        }

                        res.json({success: true, project: project.extracts, errs: errors});
                    } else {
                        res.json({success: false, err: "no_project_extracts"});
                    }
                } else {
                    res.json({success: false, err: "no_project"});
                }
            }
        });
    });
});

router.post('/get-project-progress/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.findOne({id: req.params.id}, {
            project_progress: 1,
            id: 1,
            _id: 0
        }, {lean: true}, async function (err, project) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (project) {
                    if (project.project_progress) {


                        project.project_progress.sort(compare);


                        let errors = [];

                        for (let i = 0; i < project.project_progress.length; i++) {
                            let progress = project.project_progress[i];
                            try {
                                let employee = await Employee.findOne({id: progress.employee_id}, {
                                    id: 1,
                                    name: 1,
                                    photo: 1,
                                    _id: 0,
                                    job: 1
                                });
                                if (employee) {

                                    project.project_progress[i].employee = employee;

                                } else {
                                    errors.push({id: progress.employee_id, err: "no_progress_employee"});
                                }
                            } catch (err) {
                                if (err) {
                                    errors.push({id: progress.employee_id, err: err});
                                }
                            }
                        }

                        res.json({success: true, project: project.project_progress, errs: errors});
                    } else {
                        res.json({success: false, err: "no_project_project_progress"});
                    }
                } else {
                    res.json({success: false, err: "no_project"});
                }
            }
        });
    });
});


router.post('/get-project-employees/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.findOne({id: req.params.id}, {employees: 1, id: 1, _id: 0}, function (err, project) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (project && project.employees && project.employees.length > 0) {
                    Employee.find({id: {$in: project.employees}}, function (err, employees) {
                        if (err) {
                            res.json({success: false, err: err});
                        } else {
                            if (employees) {
                                res.json({success: true, employees: employees});
                            } else {
                                res.json({success: false, err: "no_project_employees"});
                            }
                        }
                    });
                } else {
                    res.json({success: false, err: "no_project"});
                }
            }
        });
    });
});

router.post('/get-project-manager/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.findOne({id: req.params.id}, {manager: 1, id: 1, _id: 0}, function (err, project) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (project && project.manager) {
                    Employee.findOne({id: project.manager}, function (err, projectManager) {
                        if (err) {
                            res.json({success: false, err: err});
                        } else {
                            if (projectManager) {
                                res.json({success: true, project_manager: projectManager});
                            } else {
                                res.json({success: false, err: "no_project_manager"});
                            }
                        }
                    });
                } else {
                    res.json({success: false, err: "no_project"});
                }
            }
        });
    });
});


router.post('/get-contractors/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.findOne({id: req.params.id}, {contractors: 1, id: 1, _id: 0}, function (err, project) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (project) {
                    Contractor.find({id: {$in: project.contractors}}, function (err, contractors) {
                        if (err) {
                            res.json({success: false, err: err});
                        } else {
                            if (contractors) {
                                res.json({success: true, contractors: contractors});
                            } else {
                                res.json({success: false, err: "no_project_contractors"});
                            }
                        }
                    });
                } else {
                    res.json({success: false, err: "no_project"});
                }
            }
        });
    });
});

router.post('/get-suppliers/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.findOne({id: req.params.id}, {suppliers: 1, id: 1, _id: 0}, function (err, project) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (project) {
                    Supplier.find({id: {$in: project.suppliers}}, function (err, suppliers) {
                        if (err) {
                            res.json({success: false, err: err});
                        } else {
                            if (suppliers) {
                                res.json({success: true, suppliers: suppliers});
                            } else {
                                res.json({success: false, err: "no_project_suppliers"});
                            }
                        }
                    });
                } else {
                    res.json({success: false, err: "no_project"});
                }
            }
        });
    });
});

router.post('/get-workers-count/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.findOne({id: req.params.id}, {workers_count: 1, id: 1, _id: 0}, function (err, project) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (project) {
                    if (project.workers_count) {
                        res.json({success: true, workers_count: project.workers_count});
                    } else {
                        res.json({success: false, err: "no_project_workers"});
                    }
                } else {
                    res.json({success: false, err: "no_project"});
                }
            }
        });
    });
});

router.post('/get-field-photos/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.findOne({id: req.params.id}, {field_photos: 1, id: 1, _id: 0}, async function (err, project) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                if (project) {
                    if (project.field_photos) {


                        project.field_photos.sort(compare);


                        let errors = [];
                        let field_photos = [];

                        for (let i = 0; i < project.field_photos.length; i++) {
                            let photo = project.field_photos[i];
                            try {
                                let employee = await Employee.findOne({id: photo.employee_id}, {
                                    id: 1,
                                    name: 1,
                                    photo: 1,
                                    _id: 0,
                                    job: 1
                                });
                                if (employee) {
                                    let _photo = JSON.parse(JSON.stringify(photo));
                                    _photo.employee = employee;
                                    field_photos.push(_photo);
                                } else {
                                    errors.push({id: photo.employee_id, err: "no_photo_employee"});
                                }
                            } catch (err) {
                                if (err) {
                                    errors.push({id: photo.employee_id, err: err});
                                }
                            }
                        }

                        res.json({success: true, field_photos: field_photos});
                    } else {
                        res.json({success: false, err: "no_project_field_photos"});
                    }
                } else {
                    res.json({success: false, err: "no_project"});
                }
            }
        });
    });
});


router.post('/add-new-project', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        let owner = req.body.owner;
        let code = req.body.code;
        let consultant = req.body.consultant;
        let contract_value = req.body.contract_value;
        let conclusion_value = req.body.conclusion_value;
        //let expected_conclusion = req.body.expected_conclusion;
        let contract_code = req.body.contract_code;
        let receive_date = req.body.receive_date;
        let duration = req.body.duration;
        let dead_line = req.body.dead_line;
        let general_contractor = req.body.general_contractor;
        //
        //items: 1,
        //exist_items: 1,
        //new_items: 1,
        //
        //let location = req.body.location;
        let name = req.body.name;


        let project = Project({
            owner: owner,
            code: code,
            consultant: consultant,
            contract_value: contract_value,
            conclusion_value: conclusion_value,
            //expected_conclusion: expected_conclusion,
            contract_code: contract_code,
            receive_date: receive_date,
            duration: duration,
            dead_line: dead_line,
            general_contractor: general_contractor,
            //location: location,
            name: name,
            id: uuidv1(),
        });

        project.save(function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });

    });
});

router.post('/update-project/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        let owner = req.body.owner;
        let code = req.body.code;
        let consultant = req.body.consultant;
        let contract_value = req.body.contract_value;
        //let expected_conclusion = req.body.expected_conclusion;
        let contract_code = req.body.contract_code;
        let receive_date = req.body.receive_date;
        let duration = req.body.duration;
        let dead_line = req.body.dead_line;
        let general_contractor = req.body.general_contractor;
        let name = req.body.name;


        let project = {
            owner: owner,
            code: code,
            consultant: consultant,
            contract_value: contract_value,
            contract_code: contract_code,
            receive_date: receive_date,
            duration: duration,
            dead_line: dead_line,
            general_contractor: general_contractor,
            //location: location,
            name: name,
        };

        Project.updateOne({id: req.params.id}, {$set: project}, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });

    });
});


router.post('/delete-project/:id', function (req, res) {
    Tools.checkAPIToken(req, res, function (employee) {
        Project.deleteOne({id: req.params.id}, function (err) {
            if (err) {
                res.json({success: false, err: err});
            } else {
                res.json({success: true});
            }
        });
    });
});


function compare(a, b) {
    if (a.date > b.date) return -1;
    if (b.date > a.date) return 1;

    return 0;
}

module.exports = router;