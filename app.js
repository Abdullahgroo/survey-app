require('dotenv').config();

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const surveyModels = require('./models/survey');
const userModels = require('./models/user');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'survey-app-secret';

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function requireAuth(req, res, next) {
    const token = req.cookies && req.cookies.token;

    if (!token || token === 'undefined' || token.trim() === '') {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        res.clearCookie('token');
        return res.redirect('/login');
    }
}

app.get('/', (req, res) => {
    res.render('main');
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
    const email = (req.body.email || '').trim();
    const password = req.body.password || req.body.passward;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    if (!emailPattern.test(email)) {
        return res.status(400).send('Please enter a valid email address');
    }

    try {
        const user = await userModels.findOne({ email });

        if (!user) {
            return res.status(401).render('login', { error: 'Wrong email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).render('login', { error: 'Wrong email or password' });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000
        });
        return res.redirect('/profile');
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).send('Something went wrong during login. Please check your database connection.');
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

app.get('/profile', requireAuth, (req, res) => {
    res.render('profile', { user: req.user });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const email = (req.body.email || '').trim();
    const password = req.body.password || req.body.passward;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    if (!emailPattern.test(email)) {
        return res.status(400).send('Please enter a valid email address');
    }

    if (password.length < 6) {
        return res.status(400).send('Password must be at least 6 characters long');
    }

    try {
        const existingUser = await userModels.findOne({ email });

        if (existingUser) {
            return res.status(409).send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userModels.create({
            email,
            password: hashedPassword
        });

        const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
        return res.redirect('/profile');
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).send('Something went wrong during registration');
    }
});

app.get('/yoursurveys', requireAuth, async (req, res) => {
    try {
        const surveys = await surveyModels.find({ user: req.user.id }).sort({ date: -1 });
        res.render('yoursurveys', { surveys, user: req.user });
    } catch (error) {
        console.error('Load user surveys error:', error);
        res.status(500).send('Unable to load your surveys');
    }
});

app.get('/createyoursurvey', requireAuth, (req, res) => {
    res.render('createyoursurvey', { user: req.user });
});

app.post('/create', requireAuth, async (req, res) => {
    const { title, description, category, target } = req.body;

    if (!title || !description || !category || !target) {
        return res.status(400).send('All survey fields are required');
    }

    if (title.trim().length < 3 || description.trim().length < 10) {
        return res.status(400).send('Title must be at least 3 characters and description at least 10 characters');
    }

    try {
        await surveyModels.create({
            user: req.user.id,
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            target: target.trim()
        });
        return res.redirect('/profile');
    } catch (error) {
        console.error('Create survey error:', error);
        return res.status(500).send('Something went wrong while creating the survey');
    }
});

app.get('/readsurvey', async (req, res) => {
    try {
        const surveys = await surveyModels.find().sort({ date: -1 });
        res.render('all_surveys', { surveys });
    } catch (error) {
        console.error('Read surveys error:', error);
        res.status(500).send('Unable to load surveys');
    }
});

app.get('/survey/:id/respond', async (req, res) => {
    if (!surveyModels.db || !surveyModels.db.readyState) {
        return res.status(503).send('Database is not available');
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).send('Survey not found');
    }

    try {
        const survey = await surveyModels.findById(req.params.id).select('title description category target');

        if (!survey) {
            return res.status(404).send('Survey not found');
        }

        return res.render('respond', { survey, submitted: false, error: null });
    } catch (error) {
        console.error('Load response form error:', error);
        return res.status(500).send('Unable to load the response form');
    }
});

app.post('/survey/:id/respond', async (req, res) => {
    const text = (req.body.text || '').trim();

    if (!text) {
        return res.status(400).send('Response text is required');
    }

    if (text.length > 2000) {
        return res.status(400).send('Response must be 2000 characters or fewer');
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).send('Survey not found');
    }

    try {
        const survey = await surveyModels.findByIdAndUpdate(
            req.params.id,
            { $push: { responses: { text } } },
            { new: true, runValidators: true }
        ).select('title description category target');

        if (!survey) {
            return res.status(404).send('Survey not found');
        }

        return res.render('respond', { survey, submitted: true, error: null });
    } catch (error) {
        console.error('Submit response error:', error);
        return res.status(500).send('Unable to save your response');
    }
});

app.get('/survey/:id/responses', requireAuth, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).send('Survey not found');
    }

    try {
        const survey = await surveyModels.findOne({
            _id: req.params.id,
            user: req.user.id
        }).select('title description responses');

        if (!survey) {
            return res.status(404).send('Survey not found');
        }

        return res.render('responses', { survey });
    } catch (error) {
        console.error('Load responses error:', error);
        return res.status(500).send('Unable to load survey responses');
    }
});

app.use((req, res) => {
    res.status(404).send('Page not found');
});

if (require.main === module) {
    surveyModels.connectionPromise
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Survey app running on http://localhost:${PORT}`);
            });
        })
        .catch((error) => {
            console.error(error.message);
            console.error('Check that MongoDB Atlas is running, your current IP is allowed in Network Access, and your network/VPN allows outbound MongoDB connections.');
            process.exitCode = 1;
        });
}

module.exports = app;
// MERN mongoDB express react nodejs