const express = require('express');
const router = express.Router();
const ensure = require('connect-ensure-login');
const uuidv1 = require('uuid/v1');
const logger = require('../utils/error-logger.js');
const tools = require('../utils/tools.js');
const passport = require('passport');

const Admin = require('../models/admin');
const Project = require('../models/project');
const Employee = require('../models/employee');
const Supplier = require('../models/supplier');
const Contractor = require('../models/contractor');

router.use(passport.initialize());
router.use(passport.session());


// projects
router.get('/',
    ensure.ensureAuthenticated("/admin/login"),
    function (req, res) {
        tools.checkRole(req, res, "projects", function () {
            Project.find( {} ,function (err, projects) {
                if (err) {
                    logger.error("error while get projects , " + err);
                    res.render('error', {
                        title: "error while get projects",
                        message: "error : " + err,
                        error: {stack: "error id = 177admin23452754dhghd37"}
                    });
                } else {
                    res.render('projects/projects', {user: req.user, projects: projects});
                }
            });
        });

    });

router.get('/add', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "add-project", function () {
        Employee.find({} , function (err, employees) {
           if(err){
               res.render('error' , {message:err});
               logger.error("error while get employees to add project :"+err);
           }else {
               Contractor.find({} , function (err, contractors) {
                   if(err){
                       res.render('error' , {message:err});
                       logger.error("error while get Contractors to add project :"+err);
                   }else {
                       Supplier.find({} , function (err, suppliers) {
                           if(err){
                               res.render('error' , {message:err});
                               logger.error("error while get Suppliers to add project :"+err);
                           }else {
                               if(req.query.success){
                                   res.render('projects/add-project', {user: req.user , employees: employees , contractors:contractors , suppliers:suppliers , success:true});
                               }else {
                                   res.render('projects/add-project', {user: req.user , employees: employees , contractors:contractors , suppliers:suppliers});
                               }
                           }
                       });
                   }
               });
           }
        });
    });
});

router.get('/view/:id', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "view-project", function () {
        Project.findOne({id: req.params.id}, function (err, project) {
            console.log(project);
            if (err) {
                logger.error("error while get project info" + check);
                res.render('error', {
                    title: "error while get project info",
                    message: "error : " + check,
                    error: {stack: "error id = 177admin00dd3s45dsfdf275437"}
                });
            } else if(project){
                Employee.findOne({id: project.manager.id}, function (err, manager) {
                    if (err) {
                        logger.error("error while get project info" + err);
                        res.render('error', {
                            title: "error while get project info",
                            message: "error : " + err,
                            error: {stack: "error id = 177admin00dd3s45dsfdf275437"}
                        });
                    } else {
                        let engineers_ids = [];
                        if (project.engineers) {
                            project.engineers.forEach(function (value) {
                                if (value) {
                                    engineers_ids.push(value.id);
                                }
                            });
                        }

                        Employee.find({id: {$in: engineers_ids}} , function (err, engineers) {
                            if (err) {
                                logger.error("error while get project info 2 " + err);
                                res.render('error', {
                                    title: "error while get project info",
                                    message: "error 2 : " + err,
                                    error: {stack: "error id = 177admin00dd3s45dsfdf275437"}
                                });
                            } else {
                                let employees_ids = [];
                                if (project.employees) {
                                    project.employees.forEach(function (value) {
                                        if (value) {
                                            employees_ids.push(value.id);
                                        }
                                    });
                                }
                                Employee.find({id: {$in: employees_ids}} , function (err, employees) {
                                    if (err) {
                                        logger.error("error while get project info 3" + err);
                                        res.render('error', {
                                            title: "error while get project info",
                                            message: "error 3 : " + err,
                                            error: {stack: "error id = 177admin00dd3s45dsfdf275437"}
                                        });
                                    } else {
                                        res.render('projects/view-project', {
                                            user: req.user, project: project, engineers: engineers,
                                            manager: manager, employees: employees
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }else {
                res.render('error' , {message:"project is null"});
            }
        });
    });

});

router.post('/processing/add', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req, res, "add-project", function () {

        let items = [];
        let field_photos = [];
        let field_engineers = [];
        let office_engineers = [];
        let accountants = [];
        let supervisors = [];
        let suppliers = [];
        let contractors = [];
        let administrators = [];
        let foremen = [];
        let drawings = [];

        if(req.body.items){
            if(Array.isArray(req.body.items)){
                req.body.items.forEach(function (val) {
                    let obj = JSON.parse(val);
                    items.push(obj);
                });
            }else {
                let obj = JSON.parse(req.body.items);
                items.push(obj);
            }
        }

        if(req.body.field_photos){
            if(Array.isArray(req.body.field_photos)){
                req.body.field_photos.forEach(function (val) {
                    let obj = {url:val , employee_id:req.user.id , date:Date.now()};
                    field_photos.push(obj);
                });
            }else {
                let obj = {url:req.body.field_photos ,employee_id:req.user.id , date:Date.now()};
                field_photos.push(obj);
            }
        }

        if(req.body.drawings){
            if(Array.isArray(req.body.drawings)){
                req.body.drawings.forEach(function (val) {
                    let obj = JSON.parse(val);

                    drawings.push({
                        key: obj.key,
                        url: obj.url,
                        date: Date.now(),
                        employee_id: req.user.id,
                    });
                });
            }else {
                let obj = JSON.parse(req.body.drawings);

                drawings.push({
                    key: obj.key,
                    url: obj.url,
                    date: Date.now(),
                    employee_id: req.user.id,
                });
            }
        }

        //////////----====////////
        if(req.body.foremen){
            if(Array.isArray(req.body.foremen)){
                req.body.foremen.forEach(function (val) {
                    foremen.push(val);
                });
            }else {
                foremen.push(req.body.foremen);
            }
        }

        if(req.body.accountants){
            if(Array.isArray(req.body.accountants)){
                req.body.accountants.forEach(function (val) {
                    accountants.push(val);
                });
            }else {
                accountants.push(req.body.accountants);
            }
        }

        if(req.body.office_engineers){
            if(Array.isArray(req.body.office_engineers)){
                req.body.office_engineers.forEach(function (val) {
                    office_engineers.push(val);
                });
            }else {
                office_engineers.push(req.body.office_engineers);
            }
        }

        if(req.body.field_engineers){
            if(Array.isArray(req.body.field_engineers)){
                req.body.field_engineers.forEach(function (val) {
                    field_engineers.push(val);
                });
            }else {
                field_engineers.push(req.body.field_engineers);
            }
        }

        if(req.body.administrators){
            if(Array.isArray(req.body.administrators)){
                req.body.administrators.forEach(function (val) {
                    administrators.push(val);
                });
            }else {
                administrators.push(req.body.administrators);
            }
        }

        if(req.body.contractors){
            if(Array.isArray(req.body.contractors)){
                req.body.contractors.forEach(function (val) {
                    contractors.push(val);
                });
            }else {
                contractors.push(req.body.contractors);
            }
        }

        if(req.body.suppliers){
            if(Array.isArray(req.body.suppliers)){
                req.body.suppliers.forEach(function (val) {
                    suppliers.push(val);
                });
            }else {
                suppliers.push(req.body.suppliers);
            }
        }

        if(req.body.supervisors){
            if(Array.isArray(req.body.supervisors)){
                req.body.supervisors.forEach(function (val) {
                    supervisors.push(val);
                });
            }else {
                supervisors.push(req.body.supervisors);
            }
        }


        let json = {
            id : uuidv1(),
            name : req.body.name,
            code : req.body.code,
            owner : req.body.owner,
            consultant: req.body.consultant,
            contract_value: req.body.contract_value,
            //conclusion_value: req.body.conclusion_value,
            //expected_conclusion: req.body.name,
            contract_code: req.body.contract_code,
            receive_date: req.body.receive_date,
            duration: req.body.duration,
            dead_line: req.body.dead_line,
            general_contractor: req.body.general_contractor,
            assay: req.body.assay,
            //
            items : items,
            //exist_items : [{name:String ,id:String}],
            //new_items : [{name:String ,id:String}],
            //
            location:{lat: req.body.lat , lon: req.body.lon},
            //
            current_time_line:req.body.current_time_line_url,
            planned_time_line:req.body.planned_time_line_url,
            comparison_time_line:req.body.comparison_time_line_url,
            //
            field_photos:field_photos,
            //financial_outgoings:[{id:String , name:String , value:Number , date:Date , extract_number:Number}],
            manager:req.body.manager,
            office_engineers:office_engineers,
            field_engineers:field_engineers,
            administrators:administrators,
            accountants:accountants,
            supervisors:supervisors,
            contractors:contractors,
            suppliers:suppliers,
            workers_count:req.body.workers_count,
            foremen:foremen,
            drawings:drawings,
            //pre_managers:[{id:String , date:Date}],
        };

        let project = Project(json);

        project.save(function (err) {
            if (err) {
                logger.error("error while add project , " + err);
                res.render('error', {
                    title: "error while add project",
                    message: "error : " + err,
                    error: {stack: "error id = lmdladmin2345dsfdf275437"}
                });
            } else {
                res.redirect('/admin/projects/add?success=true');
            }
        });
    });
});

router.get('/remove/:id', ensure.ensureAuthenticated("/admin/"), function (req, res) {
    tools.checkRole(req , res , 'remove-project' , function () {
        Project.deleteOne({id: req.params.id}, function (err) {
            if (err) {
                logger.error("error while remove project , " + err);
                res.render('error', {
                    title: "error while remove project",
                    message: "error : " + err,
                    error: {stack: "error id = lmdladmin2345dsfdf275437"}
                });
            } else {
                res.redirect('/admin/projects');
            }
        });

    });
});

module.exports = router;