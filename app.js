const express=require('express');
const app=express();
const path=require('path');
const surveyModels=require('./models/survey');
const userModels=require('./models/user');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const cookieParser=require("cookie-parser");
const secret= "abdulboom";
app.use(cookieParser());

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
 
app.get('/logout',(req,res)=>{
    res.cookie("token","");
    res.redirect("/login");
});
app.post('/login',isLoggedIn,async (req,res)=>{
    let {email,passward}=req.body;
    let user=await userModels.findOne({email});
    if(!user) return res.status(500).send("something went wrong");
        
    bcrypt.compare(passward,user.passward,(err,result)=>{
        if(result){ 
            let token=jwt.sign({email: email},"abdulboom");
            res.cookie("token",token);
            res.render("profile");
        }
        else res.redirect('/login');
    });
    });

    app.get('/profile',(req,res)=>{
            res.render("profile");
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
            let token = jwt.sign({email: email},"abdulboom");
            res.cookie("token",token);
            res.send("registered");
        });
    });
});

app.get('/yoursurveys',(req,res)=>{
    res.render('yoursurveys');
});



app.get('/createyoursurvey',(req,res)=>{
    res.render('createyoursurvey');
});

app.post('/create',async (req,res)=>{
    let {title,description,category,target}=req.body;
    let survey=await surveyModels.create({
        title:title,
        description,
        category,
        target
           });
           res.redirect('/readsurvey');
});


app.get('/readsurvey',async (req,res)=>{
    let allsurvey=await surveyModels.find();
    res.render('all_surveys',{surveys:allsurvey});
});

function isLoggedIn(req,res,next){
    if(req.cookies.token === "") res.send("you must be logged in");
    else{
        let data=jwt.verify(req.cookies.token,"abdulboom");
        req.user = data;    
    next();
    }
}


app.listen(3000);
// MERN mongoDB express react nodejs