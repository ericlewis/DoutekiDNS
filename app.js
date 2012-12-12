// The main application script, ties everything together.
var express = require('express');
var http_auth = require('express-http-auth');
var mongoose = require('mongoose');
var app = module.exports = express.createServer();
var realm = require('express-http-auth').realm('Private');

// connect to Mongo when the app initializes
mongoose.connect(process.env.MONGOHQ_URL);

// listen port
var listen_port = process.env.PORT || 5000;

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

// set up the RESTful API, handler methods are defined in api.js
var user = require('./controllers/user.js');

var private = [realm, user.checkUser];

// show the register page
app.get('/register', user.registerStaticPage);

// show the add domain page
app.get('/domains', user.domainsStaticPage);

// get your ip
app.get('/api/v1/checkip', user.checkip);

// register the user
app.post('/api/v1/register', user.register);

// attempt update (default to username if no domain provided)
app.get('/api/v1/update/:domain?', private, user.update);

// get a list of the users domains
app.get('/api/v1/domains', private, user.getDomains);

app.get('/api/v1/domains/:domain/installer', private, user.generateBatchFile);

// delete a domain for a certain user
app.get('/api/v1/domains/delete/:domain', private, user.deleteDomain);

// add domain for certain user
app.post('/api/v1/domains', private, user.addDomain);

// edit domain information manually
app.post('/api/v1/domains/:domain', private, user.editDomain);

// shift control of a domain
app.update('/api/v1/domains/:domain', private, user.adoptDomain);


// get hosted zones and names

// delete hosted zone

// add hosted zone

app.listen(listen_port);
console.log("DoutekiDNS is listening on port: %d.", app.address().port);