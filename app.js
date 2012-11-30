// The main application script, ties everything together.
var express = require('express');
var mongoose = require('mongoose');
var app = module.exports = express.createServer();

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

app.get('/api/v1/checkip', user.checkip);
app.get('/api/v1/register/:username/:password/:domain?', user.register);
app.get('/api/v1/update/:username/:password/:domain?', user.update);

app.listen(listen_port);
console.log("4max DNS is listening on port: %d.", app.address().port);