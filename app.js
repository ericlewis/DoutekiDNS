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

app.get('/api/v1/checkip', user.checkip);
app.get('/api/v1/register/:username/:password/:domain?', user.register);
app.get('/api/v1/update', private, user.update);

app.listen(listen_port);
console.log("4max DNS is listening on port: %d.", app.address().port);