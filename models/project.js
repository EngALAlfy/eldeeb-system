//Require Mongoose
const mongoose = require('mongoose');
// Define schema
let Schema = mongoose.Schema;

let project = new Schema({
    id: {type: String, unique: true, required: true, index: true},
    name: String,
    owner: String,
    code: {type:String , default:""},
    consultant: {type:String , default:""},
    contract_value: Number,
    conclusion_value: Number,
    expected_conclusion: Boolean,
    contract_code: {type:String , default:""},
    receive_date: Date,
    duration: {type:String , default:""},
    dead_line: Date,
    general_contractor: String,
    //
    items: [{name: String, contract_id: String}],
    exist_items: [String],
    new_items: [String],
    //
    location: {lat: Number, lon: Number},
    //
    field_photos: [{
        url: String,
        title: {type:String , default:""},
        employee_id: String,
        date: Date,
        comments: [{
            id: String,
            employee_id: String,
            date: Date,
            comment: String,
        }],
    }],

    project_progress: [{
        key: String,
        progress: String,
        employee_id: String,
        date: Date,
    }]
    ,

    other_files: [{
        key: String,
        url: String,
        date: Date,
        employee_id: String,
        notes:String,
    }],

    manager: String,
    employees: [String],

    contractors: [String],
    suppliers: [String],

    workers_count: [{
        count:Number,
        day:Number,
        month:Number,
        year:Number,
        date:Date
    }],

    problems: [{
        id: String,
        employee_id: String,
        title: String,
        des: String,
        date: Date,
        solved: Boolean,
        solve_date: Date
    }],

    drawings: [{
        key: String,
        url: String,
        date: Date,
        employee_id: String,
        notes:String,
    }],

    extracts:[{
        key: String,
        url: String,
        date: Date,
        employee_id: String,
        notes:String,
    }],

    reviews :[{
        rate:Number,
        review:String,
        employee_id:String,
        reviewer_id:String,
    }],

    pre_managers: [{id: String, date: Date}],

    public_messages: [
        {
            id: String,
            date: Date,
            employee_id: String,
            text: String,
            file: String,
        }
    ],
    //_id : false
}, {timestamps: true  });

module.exports = mongoose.model('project', project);
