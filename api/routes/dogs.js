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

const Dog = require('../models/dog');


// Tüm Dog model türündeki dog objelerini çeker 
// bulamazsa 500 döndürür.
router.get('/',(req,res,next) => {
    Dog.find()
    .select('-__v') // veya  ===>>>  .select(name lifetime origin weight size usage properties health maintenance _id)
    .exec()
    .then(docs => {
        const response = {
            count: docs.length, 
            dogs: docs.map(doc=>{
                return{
                    _id:doc._id,
                    name:doc.name,
                    lifetime:doc.lifetime,
                    origin:doc.origin,
                    weight:doc.weight,
                    size:doc.size,
                    usage:doc.usage,
                    properties:doc.properties,
                    health:doc.health,
                    maintenance:doc.maintenance,
                    dogimage:doc.dogimage,
                    request:{
                        type:'GET',
                        url:process.env.URL+"/dogs/"+doc._id
                    }
                }
            })
        };
        //if(docs.length >= 0){
           res.status(200).json(response);
        //}else{
        //    res.status(404).json({
        //        message:"Not found"
        //    });
        //}
    })
    .catch(err =>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});


//dogs a post edildiğinde dog objesini oluşturur
router.post('/',upload.single('dogimage'),(req,res,next) => {
    console.log(req.file);
    const dog= new Dog({
        _id:new mongoose.Types.ObjectId(),
        name:req.body.name,
        lifetime:req.body.lifetime,
        origin:req.body.origin,
        weight:req.body.weight,
        size:req.body.size,
        usage:req.body.usage,
        properties:req.body.properties,
        health:req.body.health,
        maintenance:req.body.maintenance,
        dogimage:process.env.URL+'/'+req.file.path
    });
//oluşan dog objesini db ye kayıt eder. Kayıt başarısızsa 500 döndürür.
    dog
    .save()
    .then(result =>{
        console.log(result);
        res.status(201).json({
            message:'Created dogs successfully',
            createdDog:{
                _id:result._id,
                name:result.name,
                lifetime:result.lifetime,
                origin:result.origin,
                weight:result.weight,
                size:result.size,
                usage:result.usage,
                properties:result.properties,
                health:result.health,
                maintenance:result.maintenance,
                request:{
                    type:"GET",
                    url:process.env.URL+'/dogs/'+result._id
                }
            }
        });
    }).catch(err=> {
        console.log(err);
        res.status(500).json({
            error:err
        })
    });
});

//   ../dogs/:dogId de girilen id deki değerleri çeker
//   bulunumazsa 404 yerıne mesaj dondurur basarısız olursa 500 dondurur
router.get('/:dogId' , (req,res,next)=>{
    const id = req.params.dogId;
    Dog.findById(id)
    .select('-__v')
    .exec()
    .then(doc=>{
        console.log("From Database", doc);
        if(doc){
            res.status(200).json({
                dog:doc,
                request:{
                    type:'GET',
                    url:process.env.URL+"/dogs"
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

router.patch('/:dogId' , (req,res,next)=>{
    const id = req.params.dogId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName]= ops.value;
    }
    Dog.update({_id:id},{$set:updateOps})
    .exec()
    .then(result=>{
        res.status(200).json({
            message:'Dogs Updated',
            request:{
                type:'GET',
                url:process.env.URL+"/dogs/"+id
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

router.delete('/:dogId' , (req,res,next)=>{
    const id = req.params.dogId;
    Dog.remove({_id:id}).exec()
    .then(result=>{
        res.status(200).json({
            message:"Dog deleted",
            request:{
                type:'POST',
                url:process.env.URL+'/dogs',
                body:{
                    name:'String',lifetime:'String',origin:'String',weight:'String',size:'String',usage:'String',properties:'String',health:'String',maintenance:'String'
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