const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const dogsRoutes = require('./api/routes/dogs');
const catsRoutes = require('./api/routes/cats');

mongoose.connect('mongodb+srv://canberk:' + process.env.MONGO_ALTAS_PW + '@db-habit-x6x9j.mongodb.net/test?retryWrites=true&w=majority',{
    useUnifiedTopology: true,
    useNewUrlParser: true
});
mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req,res,next)=>{
    res.header('Access-Controll-Allow-Origin','*');
    res.header('Access-Controll-Allow-Headers','Origin');
    if(req.method==='OPTIONS'){
        res.header('Access-Controll-Aloow-Methods','Put-Post-Patch-Delete,Get')
        return res.status(200).json({})
    }
    next();
});

app.use('/dogs',dogsRoutes);
app.use('/cats',catsRoutes);

app.use((req, res, next) => {
    const error = new Error('not Found');
    error.status = 404;
    next(error);
});

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message:error.message
        }
    });
});

module.exports = app;