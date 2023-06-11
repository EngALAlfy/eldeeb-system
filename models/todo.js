//Require Mongoose
const mongoose = require('mongoose');
// Define schema
let Schema = mongoose.Schema;

let todo = new Schema({
    id: String,
    title: String,
    message: String,
    employees_read:[{id:String , date:Date}],
    employees_done:[{id:String , date:Date}],
    employees: [String],
} ,  {timestamps: true});

module.exports = mongoose.model('todo', todo);