const express =require('express');
const app=express();
const path=require('path');

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

app.listen(3000);

// MERN mongoDB express react nodejs