const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads');
    },
    filename: function(req,file,cb){
        cb(null,Date.now() + file.originalname);
    }
});

const fileFilter =(req,file,cb)=>{
    //dosya jpeg png harıcıyse reddet reddet
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true);
    }else{
        cb(null,false);
    }    
};

const upload = multer({
    storage: storage,
    limits:{
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const Cat = require('../models/cat');



router.get('/',(req,res,next)=>{
    Cat.find()
    .select("-__v")
    .exec()
    .then(docs=>{
        const response = {
            count : docs.length,
            cats : docs.map(doc=>{
                return{
                    _id : doc._id,
                    name : doc.name,
                    lifetime : doc.lifetime,
                    origin : doc.origin,
                    furcolor : doc.furcolor,
                    properties : doc.properties,
                    temperament : doc.temperament,
                    health : doc.health,
                    maintenance : doc.maintenance,
                    catimage:doc.catimage,
                    request: {
                        type:"GET",
                        url:process.env.URL+'/cats/'+doc._id
                    }
                }
            })
        };
        res.status(200).json(response);
    }).catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

router.post('/',upload.single('catimage'),(req,res,next)=>{
    const cat = new Cat({
        _id:new mongoose.Types.ObjectId(),
        name:req.body.name,
        lifetime:req.body.lifetime,
        origin:req.body.origin,
        furcolor:req.body.furcolor,
        properties:req.body.properties,
        temperament:req.body.temperament,
        health:req.body.health,
        maintenance:req.body.maintenance,
        catimage:process.env.URL+'/'+req.file.path
    });
    cat.save().then(result=>{
        console.log(result);
        res.status(201).json({
            message:'Cats was created',
            createdCat:{
                _id:result._id,
                name:result.name,
                lifetime:result.lifetime,
                origin:result.origin,
                furcolor:result.furcolor,
                properties:result.properties,
                temperament:result.temperament,
                health:result.health,
                maintenance:result.maintenance,
                request:{
                    type:"GET",
                    url:process.env.URL+'/cats/'+result._id
                }
            }
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

router.get('/:catId' , (req,res,next)=>{
    const id = req.params.catId;
    Cat.findById(id)
    .select('-__v')
    .exec()
    .then(doc=>{
        console.log("From Database", doc);
        if(doc){
            res.status(200).json({
                cat:doc,
                request:{
                    type:'GET',
                    url:process.env.URL+"/cats"
                }
            });
        }else{
            res.status(404).json({message:"No valid entry found for provided ID"});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({error:err});
    });
});

router.patch('/:catId' , (req,res,next)=>{
    const id = req.params.catId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName]= ops.value;
    }
    Cat.update({_id:id},{$set:updateOps})
    .exec()
    .then(result=>{
        res.status(200).json({
            message:'Cats Updated',
            request:{
                type:'GET',
                url:process.env.URL+"/cats/"+id
            }
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            message:err
        });
    });
});

router.delete('/:catId' , (req,res,next)=>{
    const id = req.params.catId;
    Cat.remove({_id:id}).exec()
    .then(result=>{
        res.status(200).json({
            message:"Cat deleted",
            request:{
                type:'POST',
                url:process.env.URL+'/cats',
                body:{
                    name:'String',lifetime:'String',origin:'String',furcolor:'String',temperament:'String',properties:'String',health:'String',maintenance:'String'
                }
            }
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

module.exports=router;