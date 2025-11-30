const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    email: String,
    passward: String
});

module.exports = mongoose.model('user', userSchema);