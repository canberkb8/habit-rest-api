const mongoose = require('mongoose');

const catSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name :{type:String , require:true},
    lifetime:{type:String , require:true},
    origin:{type:String , require:true},
    furcolor:{type:String , require:true},
    properties: {type:String , require:true},
    temperament:{type:String,require:true},
    health: {type:String , require:true},
    maintenance: {type:String , require:true},
    catimage: {type:String , require:true}
});

module.exports = mongoose.model('Cat',catSchema);