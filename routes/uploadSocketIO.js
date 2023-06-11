let Jimp = require('jimp');


module.exports = function (io , IOUpload) {

    // socket io
    let nsp = io.of('/upload-image');

    nsp.on('connection', function (socket) {
        // Make an instance of SocketIOFileUpload and listen on this socket:
        let uploader = new IOUpload();
        uploader.dir = __dirname + "/../public/profiles";
        uploader.listen(socket);

        // Do something when a file is saved:
        uploader.on("saved", function(event){
            Jimp.read(event.file.pathName, (err, photo) => {
                if (err) throw err;
                photo
                    .resize(256, Jimp.AUTO) // resize
                    .quality(60) // set JPEG quality
                    //.greyscale() // set greyscale
                    .write(event.file.pathName); // save
            });
        });

        // Error handler:
        uploader.on("error", function(event){
            console.log("Error from uploader", event);
        });

    });

};