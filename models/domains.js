var mongoose = require('mongoose')
   ,Schema = mongoose.Schema
   ,ObjectId = Schema.ObjectId;

var domainSchema = new Schema({
	name	  : String,
    ipaddress : String,
    updated   : {type: Date, default: Date.now},
    created   : {type: Date, default: Date.now}
});

module.exports = mongoose.model('Domain', domainSchema);