const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    surveys: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'survey' }
    ]
});

module.exports = mongoose.model('user', userSchema);