// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 4242;        // set our port

var mongoose   = require('mongoose');
mongoose.connect('mongodb://root:@127.0.0.1:27017/servers'); // connect to our database

var Server     = require('./app/models/server');

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('magic brewing...');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:4242/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to the magic.' });   
});

// more routes for our API will happen here

// on routes that end in /servers
// ----------------------------------------------------
router.route('/servers')

  // create a server (accessed at POST http://localhost:4242/api/servers)
  .post(function(req, res) {
      
      var server = new Server();      // create a new instance of the Server model
      server.name = req.body.name;  // set the servers name (comes from the request)
      server.os = req.body.os;
      server.ip = req.body.ip;
      var tags = req.body.tags.split(" ");
      server.tags = tags;

      process.env.TZ='America/Chicago';
      //process.env.TZ='UTC';
      //var offset = (new Date().getTimezoneOffset() / 60 * -1.0);
      //server.last_update = Date.now() + (offset * 3600000);
      server.last_update = Date.now() + (-6 * 3600000);

      // save the server and check for errors
      server.save(function(err) {
          if (err)
              res.send(err);

          res.json({ message: 'Server created' });
      });        
  })

  // get all the servers (accessed at GET http://localhost:4242/api/servers)
  .get(function(req, res) {
      Server.find(function(err, servers) {
          if (err)
              res.send(err);

          res.json(servers);
      });    
   });

// on routes that end in /servers/:server_id
// ----------------------------------------------------
router.route('/servers/:server_id')

  // get the server with that id (accessed at GET http://localhost:4242/api/servers/:server_id)
  .get(function(req, res) {
      Server.findById(req.params.server_id, function(err, server) {
          if (err)
              res.send(err);
          res.json(server);
      });
  })        

  // update the server with this id (accessed at PUT http://localhost:4242/api/servers/:server_id)
  .put(function(req, res) {

      // use our server model to find the server we want
      Server.findById(req.params.server_id, function(err, server) {

      if (err)
        return res.send(err);

      server.name = req.body.name;  // update the servers info
      server.os = req.body.os;
      server.ip = req.body.ip;
      var tags = req.body.tags.split(" ");
      server.tags = tags;

      process.env.TZ='America/Chicago';
      //process.env.TZ='UTC';
      //var offset = (new Date().getTimezoneOffset() / 60 * -1.0);
      //server.last_update = Date.now() + (offset * 3600000);
      server.last_update = Date.now() + (-6 * 3600000);

      // save the server
      server.save(function(err) {
      if (err)
        return res.send(err);

        res.json({ message: 'Server updated' });
      });
  })

  // delete the server with this id (accessed at DELETE http://localhost:4242/api/servers/:server_id)
  .delete(function(req, res) {
    console.log(req.params);
    console.log('_id: '+req.params.server_id);
    Server.remove({
      _id: req.params.server_id
      }, function(err, server) {
        if (err)
          return res.send(err);

        res.json({ message: 'Server deleted' });
      });
    })
  }); 

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('magic on port ' + port);


