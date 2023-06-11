const dbconnect = require('../utils/db');
const logger = require('../utils/error-logger');
const fs = require('fs-extra');
const uuid = require('uuid');

let db;


module.exports = function (io) {
    dbconnect.connect(function () {
        db = dbconnect.get();

        // socket io
        io.on('connection', function (socket) {
            console.log("connected");

            socket.on('search-project-manager', function (data) {
                db.collection("employees").find({name: {$regex: data}}).toArray(function (err, result) {
                    if (err) {
                        logger.error("error while get employee to project manager , " + err);
                    } else {
                        socket.emit('search-project-manager-result', result);
                    }
                });
            });

            socket.on('search-project-engineer', function (data) {
                db.collection("employees").find({name: {$regex: data}}).toArray(function (err, result) {
                    if (err) {
                        logger.error("error while get employee to project engineer , " + err);
                    } else {
                        socket.emit('search-project-engineer-result', result);
                    }
                });
            });

            socket.on('search-project-employee', function (data) {
                db.collection("employees").find({name: {$regex: data}}).toArray(function (err, result) {
                    if (err) {
                        logger.error("error while get employee to project employee , " + err);
                    } else {
                        socket.emit('search-project-employee-result', result);
                    }
                });
            });

            socket.on('change-project-manager', function (data) {

                db.collection('projects').findOne({id: data.project_id}, function (err, project) {
                    if (err) {
                        logger.error("error while get project manager to update, " + err);
                    } else {
                        db.collection('projects').updateOne({id: project.id}, {
                            $push: {
                                pre_managers: {
                                    id: project.manager.id,
                                    date_added: project.manager.date,
                                    date_removed: Date.now()
                                }
                            }, $set: {manager: {id: data.manager_id, date: Date.now()}}
                        }, function (err, result) {
                            if (err) {
                                logger.error("error while get update project manager , " + err);
                            } else {
                                socket.emit('refresh');
                            }
                        })
                    }
                })
            })

            socket.on('add-project-engineer', function (data) {
                db.collection('projects').updateOne({id: data.project_id}, {
                        $push: {
                            engineers: {
                                id: data.engineer_id
                            }
                        }
                    }
                    , function (err, result) {
                        if (err) {
                            logger.error("error while get update project engineer , " + err);
                        } else {
                            socket.emit('refresh');
                        }
                    });
            });
            socket.on('add-project-employee', function (data) {
                db.collection('projects').updateOne({id: data.project_id}, {
                        $push: {
                            employees: {
                                id: data.employee_id
                            }
                        }
                    }
                    , function (err, result) {
                        if (err) {
                            logger.error("error while get update project employee , " + err);
                        } else {
                            socket.emit('refresh');
                        }
                    });
            })


        });

        let nsp = io.of("/project-chat");

        nsp.on('connection', function (socket) {
            socket.on('join', function (room) {
                socket.join(room);
                console.log(room);
            });


            socket.on('get-messages', function (data) {
                db.collection('project-' + data.room + '-chats').find({}).toArray(function (err, messages) {
                    if (err) {
                        logger.error("error while get messgaes , " + data.room + err);
                    } else {
                        socket.emit('receive-all-messages', messages);
                    }
                });
            });
            socket.on('new-message', function (data) {

                db.collection('project-' + data.room + '-chats').insertOne(data.messageJson, function (err, result) {
                    if (err) {
                        logger.error("error while insert message , " + err);
                    } else {
                        nsp.to(data.room).emit('receive-message', data.messageJson);
                    }
                });

            });

            socket.on('new-message-file', function (data) {
                socket.emit('progress' , '50');
                let fileBase64 = data.message.data;
                let base64 = fileBase64.split(';base64,')[1];
                let type = fileBase64.split(';base64,')[0].split('/')[1];
                let filename = uuid() + "." + type;

                let path = __dirname + "/../public/chats/others/" + data.room + "/" + filename;

                if (type.match(/(jpg|jpeg|png|gif)/)) {
                    path = __dirname + "/../public/chats/images/" + data.room + "/" + filename;
                } else if (type.match(/(pdf)/)) {
                    path = __dirname + "/../public/chats/docs/" + data.room + "/" + filename;
                }

                fs.outputFile(path, base64, {encoding: 'base64'}, function (err) {
                    if (err) {
                        logger.error("error while upload chat image , " + err + " id :" + data.room + " path : " + path);
                        nsp.to(data.room).emit('receive-message', {
                            id: data.message.id,
                            file: filename,
                            type: type,
                            message: data.message.message,
                            username: data.message.username,
                            user_id: data.message.user_id,
                            user_photo: data.message.user_photo,
                            date: "error upload : " + err,
                        });
                    } else {
                        socket.emit('progress' , '70');
                        let messageJson = {
                            id: data.message.id,
                            file: filename,
                            type: type,
                            message: data.message.message,
                            username: data.message.username,
                            user_id: data.message.user_id,
                            user_photo: data.message.user_photo,
                            date: data.message.date,
                        };

                        db.collection('project-' + data.room + '-chats').insertOne(messageJson, function (err, result) {
                            if (err) {
                                logger.error("error while insert message , " + err);
                            } else {
                                socket.emit('progress' , '100');
                                nsp.to(data.room).emit('receive-message', messageJson);
                            }
                        });
                    }
                });

            });


            // private
            socket.on('get-private-messages', function (data) {
                db.collection('project-' + data.room + '-private-chats').find({}).toArray(function (err, messages) {
                    if (err) {
                        logger.error("error while get messages , " + data.room + err);
                    } else {
                        socket.emit('receive-all-private-messages', messages);
                    }
                });
            });
            socket.on('new-private-message', function (data) {

                db.collection('project-' + data.room + '-private-chats').insertOne(data.messageJson, function (err, result) {
                    if (err) {
                        logger.error("error while insert message , " + err);
                    } else {
                        nsp.to(data.room).emit('receive-private-message', data.messageJson);
                    }
                });

            });

            socket.on('new-private-message-file', function (data) {
                let fileBase64 = data.message.data;
                let base64 = fileBase64.split(';base64,')[1];
                let type = fileBase64.split(';base64,')[0].split('/')[1];
                let filename = uuid() + "." + type;

                let path = __dirname + "/../public/private_chats/others/" + data.room + "/" + filename;

                if (type.match(/(jpg|jpeg|png|gif)/)) {
                    path = __dirname + "/../public/private_chats/images/" + data.room + "/" + filename;
                } else if (type.match(/(pdf)/)) {
                    path = __dirname + "/../public/private_chats/docs/" + data.room + "/" + filename;
                }

                fs.outputFile(path, base64, {encoding: 'base64'}, function (err) {
                    console.log(err);
                    if (err) {
                        logger.error("error while upload chat image , " + err + " id :" + data.room + " path : " + path);
                    } else {
                        let messageJson = {
                            id: data.message.id,
                            file: filename,
                            type: type,
                            message: data.message.message,
                            username: data.message.username,
                            user_id: data.message.user_id,
                            user_photo: data.message.user_photo,
                            date: data.message.date,
                        };

                        db.collection('project-' + data.room + '-private-chats').insertOne(messageJson, function (err, result) {
                            if (err) {
                                logger.error("error while insert message , " + err);
                            } else {
                                nsp.to(data.room).emit('receive-private-message', messageJson);
                            }
                        });
                    }
                });

            });

        });

    });
};