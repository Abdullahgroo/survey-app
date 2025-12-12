const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/surveyapp');

const surveySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type: Date,
        default: Date.now
    },
    title: String,
    description: String,
    category: String,
    target: String
});

module.exports = mongoose.model('survey', surveySchema);
