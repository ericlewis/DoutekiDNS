// the User Controller
var User = require('../models/users.js'),
	Domain = require('../models/domains.js'),
	awssum = require('awssum'),
	amazon = awssum.load('amazon/amazon'),
	Route53 = awssum.load('amazon/route53').Route53,
	crypto = require('crypto'),
	fs = require('fs');

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

exports.registerStaticPage = function(req, res){
	res.sendfile('./html/register.html');
}

exports.domainsStaticPage = function(req, res){
	res.sendfile('./html/domains.html');
}

exports.generateBatchFile = function(req, res) {
	fs.readFile('./templates/install_client_windows.tmp', 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		var sendFile = data.replace('$USERNAME', req.username);
		sendFile = sendFile.replace('$PASSWORD', req.password);
		sendFile = sendFile.replace('$NAME', req.params.domain);

		res.attachment('install_client.bat');
		res.end(sendFile, 'UTF-8')
	});
};

// register user, and initial domain
exports.register = function(req, res){
	if(req.body.username.length > 4 && req.body.password.length > 4){

		var shasum = crypto.createHash('sha1');
	
		var username = req.body.username.toLowerCase(),
			password = shasum.update(req.body.password).digest('hex'),
			clientIp = getClientIp(req),
			userData = {
				username	: username, 
				password	: password
			},
			domainData = {
				name	  : username+'.'+masterDomain,
				ipaddress :	clientIp,
				owner     : username
			}
		
		if(req.body.domain){
			domainData.name = req.body.domain+'.'+masterDomain;
		}
		
		
		var user = new User(userData);
		var domain = new Domain(domainData);		
		
		User.findOne({username: username}, function(err, result){
			if(!err){
				if(!result){
				
					var params = {
					    HostedZoneId   : hostedZoneId,
					    Comment        : 'Updated subdomain',
					    Changes        : [
					        {
					            Action          : 'CREATE',
					            Name            : username+'.'+masterDomain,
					            Type            : 'A',
					            Ttl             : '60',
					            ResourceRecords : [clientIp],
					        },
					     ]
					};
					
					r53.ChangeResourceRecordSets(params, function(err, data) {
					    if(!err){
					    	user.save(function(err){
					    		if(!err){
					    			console.log(username, "ADDED_USER");
							    	domain.save(function(err) { 
							    		if(!err){
							    			console.log(username, "UPDATED_IP");
								    		res.json({success: true, message: "UPDATED_IP", ip: clientIp}, 200);
							    		}else{
							    			console.error(username, err);
								    		res.json({success: false, message: "DNS_ERROR"}, 500);
							    		}
							    	});
							    }else{
								    console.error(username, err);
								    res.json({success: false, message: "USER_EXISTS"});
							    }
					    	});
					    }else{
					    	console.error(username, err);
						   	res.json({success: false, message: "DNS_ERROR"}, 500);
					    }
					    			    
					});
					
				}else{
					console.error(username, "USER_EXISTS");
					res.json({success: false, message: "USER_EXISTS"});
				}
			}else{
				console.error(username, err);
				res.json({success: false, message: "LOOKUP_ERROR"}, 500);
			}
		});
			
	
	}else{
		res.json({success: false, message: "INVALID_INPUT"});
	}
};

exports.update = function(req, res) { 
	if(req.username.length > 4 && req.password.length > 4){

		var shasum = crypto.createHash('sha1');
	
		var domainName = "",
			username   = req.username,
			password   = shasum.update(req.password).digest('hex'),
			clientIp   = getClientIp(req);
		
		if(req.params.domain){
			domainName = req.params.domain;
		}else{
			domainName = username;
		}
		
		domainName += "." + masterDomain;
			
		User.findOne({ username: username }, function(err, result){
			if(!err){
				if(result){
					if(password == result.password){
						Domain.findOne({name: domainName}, function(err, domain){
							if(!err){
								if(domain){
									if(domain.owner == username){
										if(domain.ipaddress == clientIp){
											res.json({success:true, message: "NO_CHANGE"});
										}else{
											var params = {
											    HostedZoneId   : hostedZoneId,
											    Comment        : 'Updated domains.',
											    Changes        : [
											        {
											            Action          : 'DELETE',
											            Name            : domainName,
											            Type            : 'A',
											            Ttl             : '60',
											            ResourceRecords : [domain.ipaddress],
											        },
											        {
											            Action          : 'CREATE',
											            Name            : domainName,
											            Type            : 'A',
											            Ttl             : '60',
											            ResourceRecords : [clientIp],
											        },
											     ]
											};
											
											r53.ChangeResourceRecordSets(params, function(err, data) {
											    if(!err){
											    	domain.ipaddress = clientIp;
													domain.updated = new Date();
													
													domain.save(function(err){
														if(!err){
															res.json({success: true, message: "UPDATED_IP"});
														}else{
															console.error(username, err);
															res.json({success: false, message: "RECORD_ERROR"});
														}
													});
													
											    }else{
											    	console.error(username, err);
												   	res.json({success: false, message: "DNS_ERROR"}, 500);
											    }
											});
										}
										
									}else{
										console.warn(username, "INVALID_CREDENTIALS");
										res.json({success: false, message: "INVALID_CREDENTIALS"}, 403);
									}
								}else{
									console.warn(username, "RECORD_MISSING");
									res.json({success: false, message: "RECORD_MISSING"}, 404);
								}
							}
						});
													
					}else{
						console.warn(username, "INCORRECT_PASSWORD");
						res.json({success: false, message: "INCORRECT_PASSWORD"}, 403);
					}		
					
				}else{
					console.warn(username, "RECORD_MISSING");
					res.json({success: false, message: "RECORD_MISSING"}, 404);
				}
			}else{
				console.error(username, err);
				res.json({success: false, message: "LOOKUP_ERROR"}, 500);
			}
		});
	
	}else{
		res.json({success: false, message: "INVALID_INPUT"});
	}
};


exports.checkUser = function(req, res, next) { 
	var	shasum = crypto.createHash('sha1');

	var username = req.username,
		password = shasum.update(req.password).digest('hex');


	User.findOne({ username: username }, function(err, result){
		if(!err){
			if(result){
				if(password == result.password){
					next();
				}else{
					console.warn(username, "INCORRECT_PASSWORD");
					res.send({success: false, message: "INCORRECT_PASSWORD"}, 403);
				}
			}else{
				console.warn(username, "NO_USER");
				res.send({success: false, message: "NO_USER"}, 404);
			}
		}else{
			console.error(username, err);
			res.send({success: false, message: "USER_LOOKUP_ERROR"}, 500);
		}		
	});
};

exports.getDomains = function(req, res) {
	Domain.find({owner: req.username}, function(err, domains) {
		if(!err){
			res.json({success: true, domains: domains});
		}else{
			console.error(req.username, err);
			res.json({success: false, domains: [], message: "NO_DOMAINS"});
		}
	});
};

exports.addDomain = function(req, res) { 

	if(req.body.domain.length > 4){
		var	clientIp   = getClientIp(req);
		
		var domainData = {
			name	  : req.body.domain.toLowerCase()+'.'+masterDomain,
			ipaddress :	clientIp,
			owner     : req.username
		}
	
		var domain = new Domain(domainData);
		
		domain.save(function(err) { 
			if(!err){
				var params = {
				    HostedZoneId   : hostedZoneId,
				    Comment        : 'Updated subdomain',
				    Changes        : [
				        {
				            Action          : 'CREATE',
				            Name            : req.body.domain+'.'+masterDomain,
				            Type            : 'A',
				            Ttl             : '60',
				            ResourceRecords : [clientIp],
				        },
				     ]
				};
				
				r53.ChangeResourceRecordSets(params, function(err, data) {
				    if(!err){
				    	res.json({success: true, message: "UPDATED_IP"});
				    }else{
				    	console.error(username, err);
					   	res.json({success: false, message: "DNS_ERROR"}, 500);
				    }
				});
			}else{
				console.warn(req.username, "DOMAIN_EXISTS");
				res.json({success: false, message: "DOMAIN_EXISTS"});
			}
		});
	}else{
		console.warn(req.username, "INVALID_INPUT");
		res.json({success: false, message: "INVALID_INPUT"});
	}
};

exports.deleteDomain = function(req, res) { 
	var id = req.params.domain

	Domain.findOne({_id: id}, function(err, domain){
		if(!err){
			if(domain){
				var params = {
				    HostedZoneId   : hostedZoneId,
				    Comment        : 'Updated domains.',
				    Changes        : [
				        {
				            Action          : 'DELETE',
				            Name            : domain.name,
				            Type            : 'A',
				            Ttl             : '60',
				            ResourceRecords : [domain.ipaddress],
				        }
				     ]
				};
				
				r53.ChangeResourceRecordSets(params, function(err, data) {
				    if(!err){
						domain.remove(function(err){
							if(!err){
								res.json({success: true, message: "DOMAIN_REMOVED"});
							}else{
								console.error(req.username, err);
								res.json({success: false, message: "REMOVE_ERROR"}, 500);
							}
						});
				    }else{
				    	console.error(req.username, err);
					   	res.json({success: false, message: "DNS_ERROR"}, 500);
				    }
				});
				
			}else{
				console.warn(req.username, "MISSING_DOMAIN");
				res.json({success: false, message: "MISSING_DOMAIN"});
			}
		}else{
			console.error(req.username, err);
			res.json({success: false, message: "REMOVE_ERROR"});
		}
	});
};

exports.editDomain = function(req, res) { 

};

exports.adoptDomain = function(req, res) { 

};