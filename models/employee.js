//Require Mongoose
const mongoose = require('mongoose');
// Define schema
let Schema = mongoose.Schema;

let employee = new Schema({
    id: {type: String, unique: true, required: true, index: true},
    username: String,
    password: String,
    name: String,
    job: {title: String, date: Date},
    qualification: {title: String, date: Date},
    birth: {date: Date, address: String},
    address: String,
    phones: [String],
    code: String,
    email: String,
    insurance: {type: Number, default: 0},
    photo: String,
    contract: Boolean,
    receipt: {receipt: Boolean, value: Number},
    token: String,

    salary: {type: Number, default: 0},

    paid_holidays: {type: Number, default: 0},


    attendance: [{
        project: String,
        attendance: Boolean,
        date: Number,
        day: Number,
        month: Number,
        year: Number,
        notes: String,
        taker_id: String,
    }],

    review: {
        rate: Number,
        reviews: [{
            comment: String,
            reviewer_id: String,
        }],
    },

    // ids = projects ids ex.
    roles: [{name: String, _id: false}],


    salary_info: [{
        month: Number,
        year: Number,

        salary: {type: Number, default: 0},

        month_days: {type: Number, default: 0},
        fridays: {type: Number, default: 0},

        formal_holidays: {type: Number, default: 0},
        paid_holidays: {type: Number, default: 0},
        work_days: {type: Number, default: 0},

        attend_days: {type: Number, default: 0},
        absence_days: {type: Number, default: 0},

        attendance_salary: {type: Number, default: 0},

        borrows: {type: Number, default: 0},
        discounts: {type: Number, default: 0},
        additions: {type: Number, default: 0},
        rewards: {type: Number, default: 0},

        final_salary: {type: Number, default: 0},
        _id: 0,
    }],
    //_id : false
}, {timestamps: true});

module.exports = mongoose.model('employee', employee);