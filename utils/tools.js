const Employee = require('../models/employee');


const checkRole = function (req, res, role, callback) {
    if (req.user.roles.includes(role)) {
        callback();
    } else {
        res.render('error', {message: "no access here"});
    }
};

const checkAPIToken = function (req, res, callback) {
    if (req.body.token) {
        let token = String(req.body.token);
        Employee.findOne({token: token}, function (err, employee) {
                if (err) {
                    res.json({success: false, err: err});
                } else {
                    if (employee) {
                        callback(employee);
                    } else {
                        res.json({success: false, err: "invalid_token"});
                    }
                }
            }
        )
    } else {
        res.json({success: false, err: "no_token"});
    }
};

const checkSocketToken = function (socket, callback) {
    if (socket.request.headers) {
        let token = String(socket.request.headers.token);
        Employee.findOne({token: token}, function (err, employee) {
                if (err) {
                    socket.emit('err' , {err: err});
                } else {
                    if (employee) {
                        callback(employee);
                    } else {
                        socket.emit('err' , {err: "invalid_token"});
                    }
                }
            }
        )
    } else {
        socket.emit('ere' , {err: "no_token"});
    }
};

module.exports.checkRole = checkRole;
module.exports.checkAPIToken = checkAPIToken;
module.exports.checkSocketToken = checkSocketToken;