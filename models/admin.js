//Require Mongoose
const mongoose = require('mongoose');
// Define schema
let Schema = mongoose.Schema;

let admin = new Schema({
    id: String,
    name: String,
    photo: String,
    username: String,
    password: String,
    roles:[String],
} ,  {timestamps: true});

module.exports =  mongoose.model('admin', admin );