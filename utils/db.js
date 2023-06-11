const MongoClient = require('mongodb').MongoClient;
const logger = require('../utils/error-logger.js');
const mongoDbUrl = 'mongodb://127.0.0.1:27017';
const mongoClient = new MongoClient(mongoDbUrl);

let mongodb;

function connect(callback){
    mongoClient.connect(function (err, client) {
        if (err) {
            logger.error(err);
            return;
        }
        console.log("Connected successfully to server");
        mongodb = client.db("eldeebsystem");
        callback();
    });
}
function get(){
    return mongodb;
}

function close(){
    mongodb.close();
}

module.exports = {
    connect,
    get,
    close
};
