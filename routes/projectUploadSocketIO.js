const logger = require('../utils/error-logger');
const fs = require('fs-extra');
const uuid = require('uuid');

module.exports = function (io) {

    // socket io
    let nsp = io.of('/project-uploads');

    nsp.on('connection', function (socket) {
        socket.on('new-file', function (data) {
            socket.emit('progress', {id: data.id, percent: 50});
            let fileBase64 = data.data;
            let base64 = fileBase64.split(';base64,')[1];
            let type = fileBase64.split(';base64,')[0].split('/')[1];
            let filename = uuid() + "." + type;

            let path = __dirname + "/../public/projects-files/" + filename;

            socket.emit('progress', {id: data.id, percent: 70});

            fs.outputFile(path, base64, {encoding: 'base64'}, function (err) {
                if (err) {
                    logger.error("error while upload , " + err + " path : " + path);
                } else {
                    socket.emit('progress', {id: data.id, percent: 90});
                    socket.emit('success', {id: data.id, filename: data.filename, file: filename});
                }
            });
        })

    });

};