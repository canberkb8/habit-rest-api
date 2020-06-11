const mongoose = require('mongoose');

const dogSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {type:String , require:true},
    lifetime: {type:String , require:true},
    origin: {type:String , require:true},
    weight: {type:String , require:true},
    size: {type:String , require:true},
    usage: {type:String , require:true},
    properties: {type:String , require:true},
    health: {type:String , require:true},
    maintenance: {type:String , require:true},
    dogimage: {type:String , require:true}
});

module.exports = mongoose.model('Dog',dogSchema);