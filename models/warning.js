//Require Mongoose
const mongoose = require('mongoose');
// Define schema
let Schema = mongoose.Schema;

let warning = new Schema({
    id: String,
    title: String,
    message: String,
    project:String,
    employees_read:[{id:String , date:Date}],
    employees_fixed:[{id:String , date:Date}],
    employees: [String],
} ,  {timestamps: true});

module.exports = mongoose.model('warning', warning);