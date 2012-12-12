// The User model
 
var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   ,ObjectId = Schema.ObjectId;

var domainSchema = new Schema({
	name	  : String,
    ipaddress : String,
    updated   : {type: Date, default: Date.now},
    created   : {type: Date, default: Date.now}
});
   
var userSchema = new Schema({
    username : {type: String, index: { unique: true }},
    password : String,
    updated  : {type: Date, default: Date.now},
    created  : {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', userSchema);