const express = require('express');
const router = express.Router();
const uuidv1 = require('uuid/v1');
const Employee = require('../models/employee');


const employeesRouter = require('./employees');
const contractorsRouter = require('./contractors');
const suppliersRouter = require('./suppliers');
const projectsRouter = require('./projects');
const notificationsRouter = require('./notifications');
const todoRouter = require('./todo');
const financeRouter = require('./finance');
const profileRouter = require('./profile');
const loginRouter = require('./login');
const statusRouter = require('./status');

router.use('/employees' , employeesRouter);
router.use('/contractors' , contractorsRouter);
router.use('/suppliers' , suppliersRouter);
router.use('/projects', projectsRouter);
router.use('/todo', todoRouter);
router.use('/notifications', notificationsRouter);
router.use('/finance', financeRouter);
router.use('/profile', profileRouter);
router.use('/login', loginRouter);
router.use('/status', statusRouter);

// Define routes.
router.get('/' ,
    function (req, res) {
        res.json({success:false , err:"not_allowed"});
    });

module.exports = router;