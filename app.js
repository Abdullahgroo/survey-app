const express =require('express');
const app=express();
const path=require('path');
const surveyModels=require('./models/survey');

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.get('/',(req,res)=>{
    res.render('main');
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
           res.send(survey);
});

app.get('/readsurvey',async (req,res)=>{
    let surveys=await surveyModels.find();
    res.send(surveys);
})

app.listen(3000);
// MERN mongoDB express react nodejs