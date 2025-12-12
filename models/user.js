const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    email: String,
    passward: String,
    surveys: [
        {type: mongoose.Schema.Types.ObjectId, ref: "survey"}
    ]
});

module.exports = mongoose.model('user', userSchema);