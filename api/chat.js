const Project = require('../models/project');
const Employee = require('../models/employee');
const Tools = require('../utils/tools');
const fs = require('fs-extra');
const uuid = require('uuid');


module.exports = function (io) {

    let nsp = io.of('/api/projects');


    nsp.on('connect', function (socket) {
        Tools.checkSocketToken(socket, function (employee) {

            socket.emit('user', {id: employee.id, name: employee.name, photo: employee.photo});
            let room = String(socket.request.headers.id);

            socket.join(room);

            // public
            socket.on('get-all-public', function (data) {
                Project.findOne({id: data.project}, {
                    public_messages: 1,
                    _id: 0,
                }, async function (err, project) {
                    if (err) {
                        socket.emit('err', {err: err});
                    } else {
                        if (project.public_messages) {
                            let messages = [];
                            let errors = [];
                            for (let i = 0; i < project.public_messages.length; i++) {
                                let chat = project.public_messages[i];
                                try {
                                    let employee = await Employee.findOne({id: chat.employee_id}, {
                                        id: 1,
                                        name: 1,
                                        photo: 1,
                                        _id: 0,
                                        job: 1
                                    });
                                    if (employee) {
                                        let _chat = JSON.parse(JSON.stringify(chat));
                                        _chat.employee = employee;
                                        messages.push(_chat);
                                    } else {
                                        errors.push({id: chat.employee_id, err: "no_chat_employee"});
                                    }
                                } catch (err) {
                                    errors.push({id: chat.id, err: err});
                                }
                            }

                            if (errors.length > 0) {
                                socket.emit('err', errors);
                            }

                            socket.emit('all-public', {messages: messages, project: data.project});
                        }
                    }
                });
            });

            socket.on('add-new-public', function (data) {
                if (data.file) {
                    let base64 = data.file.base;
                    let type = data.file.ext;
                    let filename = uuid() + "." + type;

                    let path = __dirname + "/../public/chats/" + room + "/" + filename;

                    fs.outputFile(path, base64, {encoding: 'base64'}, function (err) {
                        if (err) {
                            socket.emit('err', {err: err});
                        } else {
                            data.message.image = filename;
                            console.log(data.message.image);
                            let message = {
                                id: data.message.id, text: data.message.text,
                                date: data.message.createdAt,
                                employee_id: data.message.user.uid,
                                file: data.message.image,
                            };

                            Project.updateOne({id: data.project}, {$push: {public_messages: message}}, function (err) {
                                if (err) {
                                    socket.emit('err', {err: err});
                                } else {
                                    nsp.to(room).emit('new-public', {message: data.message, project: data.project});
                                }
                            });
                        }
                    });

                } else {
                    let message = {
                        id: data.message.id, text: data.message.text,
                        date: data.message.createdAt,
                        employee_id: data.message.user.uid,
                    };

                    Project.updateOne({id: data.project}, {$push: {public_messages: message}}, function (err) {
                        if (err) {
                            socket.emit('err', {err: err});
                        } else {
                            nsp.to(room).emit('new-public', {message: data.message, project: data.project});
                        }
                    });
                }

            });


        });
    });
};