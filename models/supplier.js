//Require Mongoose
const mongoose = require('mongoose');
// Define schema
let Schema = mongoose.Schema;

let supplier = new Schema({
    id: String,
    name: String,
    field: String,
    contract: Boolean,
    contract_image: String,
    contract_completion: Boolean,
    items: [String],
    phones: [String],
} ,  {timestamps: true});

module.exports = mongoose.model('supplier', supplier);