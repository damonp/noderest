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
    res.json(200, { message: 'hooray! welcome to magic.js' });   
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
          if (err)  {
            console.log(err);
            return res.send(err);
          }

          console.log(server)
          res.json(200, { message: 'Server created', server: server });
          //res.send(200, server)
      });        
  })

  // get all the servers (accessed at GET http://localhost:4242/api/servers)
  .get(function(req, res) {
      Server.find(function(err, servers) {
          if (err)  {
            console.log(err);
            return res.send(err);
          }

          res.json(200, servers);
      });    
   });

// on routes that end in /servers/:server_id
// ----------------------------------------------------
router.route('/servers/:server_id')

  // get the server with that id (accessed at GET http://localhost:4242/api/servers/:server_id)
  .get(function(req, res) {
      Server.findById(req.params.server_id, function(err, server) {
          if (err)  {
            console.log(err);
            return res.send(err);
          }

          console.log(server)
          res.json(200, server);
      });
  })        

  // update the server with this id (accessed at PUT http://localhost:4242/api/servers/:server_id)
  .put(function(req, res) {

    // use our server model to find the server we want
    Server.findById(req.params.server_id, function(err, server) {

      if (err)  {
        console.log(err);
        return res.send(500, err);
      }

      if(!server) {
        return res.json(404, { message: 'Not Found' }); 
      }

      console.log(server)
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
        if (err)  {
          console.log(err);
          return res.send(404, err);
        }

        res.json(204, { message: 'Server updated', server: server });
        //res.send(201, server)        
      });
  })
/*
23-Dec-14 20:09:47
removed all DELETE methods in favor of PUT /server/:server_id/delete (below)
support for DELETE seems hit or miss

  // delete the server with this id (accessed at DELETE http://localhost:4242/api/servers/:server_id)
  .delete(function(req, res) {
    console.log(req.params);
    console.log('_id: '+req.params.server_id);


//    Server.remove({
//      _id: req.params.server_id
//      }, function(err, server) {
//        if (err)  {
//          console.log(err);
//          return res.send(err);
//        }
//
//        res.json(200, { message: 'Server deleted' });
//      });
//  

    //Server.remove(req.params.server_id, function(err, docs) {
    Server.findById(req.params.server_id, function(err, server) {
      if (err)  {
        console.log(err);
        return res.send(500, err);
      }

      if(!server) {
        return res.json(404, { message: 'Not Found' }); 
      }

      server.remove(server._id, function(err, docs) {
        if (err)  {
          console.log(err);
          return res.send(409, err);
        }
      });

      res.json(200, { message: 'Server deleted' });
      //res.send(204);
    });

    })
*/
  }); 

 router.post('/servers/:server_id/delete', function(req, res) {
    Server.findById(req.params.server_id, function(err, server) {
      if (err)  {
        console.log(err);
        return res.send(500, err);
      }

      if(!server) {
        return res.json(404, { message: 'Not Found' }); 
      }

      server.remove(server._id, function(err, docs) {
        if (err)  {
          console.log(err);
          return res.send(409, err);
        }
      });

      console.log(server)
      res.json(200, { message: 'Server deleted', server: server });
      //res.send(204);
    });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

app.use(express.static(__dirname + '/pages'));
//app.use('/pages', express.static(__dirname + '/pages'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('magic.js:' + port + ' l i s t e n i n g . . . ');


