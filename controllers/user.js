// the User Controller
var User = require('../models/users.js');
var Domain = require('../models/domains.js');

var awssum = require('awssum');
var amazon = awssum.load('amazon/amazon');
var Route53 = awssum.load('amazon/route53').Route53;

var r53 = new Route53({
  'accessKeyId'     : process.env.AWS_ACCESSKEY,
  'secretAccessKey' : process.env.AWS_SECRETKEY,
  'region'          : amazon.US_EAST_1
});

var hostedZoneId = process.env.AWS_HOSTZONEID;
var masterDomain = process.env.AWS_HOSTDOMAIN;

// get a users ip address
function getClientIp(req) {
  var ipAddress;
  var ipString = req.header('x-forwarded-for'); 
  if (ipString) {
    var forwardedIps = ipString.split(',');
    ipAddress = forwardedIps[0];
  }
  if (!ipAddress) {
    ipAddress = req.connection.remoteAddress;
  }
  return ipAddress;
};

// return the users ip address
exports.checkip = function(req, res){
	res.json({ip: getClientIp(req)});
};

// register user, and initial domain
exports.register = function(req, res){
	
	var userData = {
		username	: req.params.username, 
		password	: req.params.password
	}
	
	var domainData = {
		name	  : req.params.username,
		ipaddress :	getClientIp(req)
	}
	
	if(req.params.domain){
		domainData.name = req.params.domain;
	}
	
	var user = new User(userData);
	var domain = new Domain(domainData);
	
	user.domains.push(domain);
	
	user.save(function(err){
		if(!err){
			var params = {
			    HostedZoneId   : hostedZoneId,
			    Comment        : 'Updated subdomain',
			    Changes        : [
			        {
			            Action          : 'CREATE',
			            Name            : req.params.username+'.'+masterDomain,
			            Type            : 'A',
			            Ttl             : '60',
			            ResourceRecords : [getClientIp(req)],
			        },
			     ]
			};
			
			r53.ChangeResourceRecordSets(params, function(err, data) {
			    if(!err){
					fs = require('fs')
					fs.readFile('./template.xml', 'utf8', function (err,data) {
						if (err) {
							return console.log(err);
						}
						var sendFile = data.replace('$USERNAME', req.params.username);
						sendFile = sendFile.replace('$PASSWORD', req.params.password);
						console.log(sendfile)
						res.sendfile('./template.xml');
						//res.json({success: true});
					});
					// read file, 
						// write to file.
							// send file
			    }else{
				   	res.json({success: false, message: err});
			    }
			    			    
			});
		}else{
			res.json({success: false, message: err});
		}
	});
};

exports.update = function(req, res) { 
	// find user & password & domain, else, register problem.
	var domainName = "";
	
	if(req.params.domain){
		domainName = req.params.domain;
	}else{
		domainName = req.username;
	}
		
	User.findOne({ username: req.username }, function(err, result){
		if(!err){
			if(result){
				if(result.domains.length > 0 && req.password == result.password){
					result.domains.forEach(function(item, index){
						if(item.name == domainName){
							if(item.ipaddress != getClientIp(req)){
								var params = {
								    HostedZoneId   : hostedZoneId,
								    Comment        : 'Updated domains.',
								    Changes        : [
								        {
								            Action          : 'DELETE',
								            Name            : domainName+'.'+masterDomain,
								            Type            : 'A',
								            Ttl             : '60',
								            ResourceRecords : [item.ipaddress],
								        },
								        {
								            Action          : 'CREATE',
								            Name            : domainName+'.'+masterDomain,
								            Type            : 'A',
								            Ttl             : '60',
								            ResourceRecords : [getClientIp(req)],
								        },
								     ]
								};
								
								r53.ChangeResourceRecordSets(params, function(err, data) {
								    if(!err){
								    	result.domains[index].ipaddress = getClientIp(req);
								    	
								    	result.save(function(err){
								    		if(!err){
										    	res.json({success: true});
								    		}else{
									    		res.json({success: false, message: err});
								    		}
								    	});
								    	
								    }else{
									   	res.json({success: false, message: err});
								    }
								});		
							}else{
								res.json({success: false, message: "No change in IP."});
							}					
						}
					});
												
				}else{
					res.json({success: false, message: "Password doesn't match."});
				}		
				
			}else{
				res.json({success: false, message: "no record found for: "+req.username});
			}
		}else{
			res.json({success: false, message: err});
		}
	});
};


exports.checkUser = function(req, res, next) { 
	User.findOne({ username: req.username }, function(err, result){
		if(!err){
			if(result){
				if(result.domains.length > 0 && req.password == result.password){
					next();
				}else{
					res.send({success: false, message: "Unauthorized"}, 403);
				}
			}else{
				res.send({success: false, message: "Unauthorized"}, 403);
			}
		}else{
			res.send({success: false, message: "Unauthorized"}, 403);
		}		
	});
};