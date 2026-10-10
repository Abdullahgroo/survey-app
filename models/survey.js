const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI;
let connectionPromise;

if (!mongoUri) {
    connectionPromise = Promise.reject(new Error('MONGODB_URI is missing. Add your MongoDB Atlas connection string to the .env file.'));
} else {
    mongoose.set('bufferCommands', false);
    connectionPromise = mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000
    })
        .then(() => console.log('MongoDB connected'))
        .catch((error) => {
            if (error.message && error.message.toLowerCase().includes('bad auth')) {
                throw new Error('MongoDB Atlas authentication failed. Check the database user credentials and Database Access settings in Atlas.');
            }
            throw new Error(`MongoDB connection failed: ${error.message}`);
        });
}

connectionPromise.catch(() => {});

const surveySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    date: {
        type: Date,
        default: Date.now
    },
    title: String,
    description: String,
    category: String,
    target: String,
    responses: [{
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },
        date: {
            type: Date,
            default: Date.now
        }
    }]
});

const surveyModel = mongoose.model('survey', surveySchema);
surveyModel.connectionPromise = connectionPromise;

module.exports = surveyModel;
