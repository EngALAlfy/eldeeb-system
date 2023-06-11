//Require Mongoose
const mongoose = require('mongoose');
// Define schema
let Schema = mongoose.Schema;

let notification = new Schema({
    id: String,
    title: String,
    message: String,
    employees_read:[{id:{type:String /*, unique : true*/} , date:Date}],
    employees: [String],
} ,  {timestamps: true});

module.exports = mongoose.model('notification', notification);