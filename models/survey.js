const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/surveyapp');

const userSchema = new mongoose.Schema({
    name: String,
    description: String,
    field: String,
    target_audience: String
});

module.exports = mongoose.model('survey', userSchema);
