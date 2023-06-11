//Require Mongoose
const mongoose = require('mongoose');
// Define schema
let Schema = mongoose.Schema;

let item = new Schema({
    id: String,
    name: String,
} ,  {timestamps: true});

module.exports = mongoose.model('item', item);