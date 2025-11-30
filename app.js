const express=require('express');
const app=express();
const path=require('path');
const surveyModels=require('./models/survey');
const userModels=require('./models/user');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.get('/',(req,res)=>{
    res.render('main');
});


app.get('/login',(req,res)=>{
    res.render('login');
});
app.post('/user',async (req,res)=>{
    let {email,passward}=req.body;
    let user=await userModels.findOne({email});
    if(!user) return res.status(500).send("something went wrong");
           
    bcrypt.compare(passward,user.passward,(err,result)=>{
        if(result) return res.status(500).redirect('/profile');
        else res.redirect('/login');
    });
    });

    app.get('/profile',isLoggedIn,async (req,res)=>{
        let user= await userModels.findOne({email: req.user.email});
        console.log(user);
        res.render('profile');
    });

app.get('/register',(req,res)=>{
    res.render('register');
});
app.post('/register',async (req,res)=>{
    let {email,passward}=req.body;
    let user = await userModels.findOne({email});
    if(user) return res.status(500).send("user already exist");

    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(passward,salt,async (err,hash)=>{
           await userModels.create({
                email,
                passward:hash
            });
        });
    });
});


app.get('/createyoursurvey',(req,res)=>{
    res.render('createyoursurvey');
});

app.post('/create',async (req,res)=>{
    let {title,description,category,target}=req.body;
    let survey=await surveyModels.create({
        name:title,
        description:description,
        field:category,
        target_audience:target
           });
           res.redirect('/createyoursurvey');
});


app.get('/readsurvey',async (req,res)=>{
    let allsurvey=await surveyModels.find();
    res.render('all_surveys',{surveys:allsurvey});
});

function isLoggedIn(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');

    try {
        const user = jwt.verify(token, 'YOUR_SECRET');
        req.user = user;
        next();
    } catch (err) {
        return res.redirect('/login');
    }
}

app.listen(3000);
// MERN mongoDB express react nodejs