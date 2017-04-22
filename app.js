var oracledb = require('oracledb');
var http = require('http');
var path = require('path');
var dbConfig = require('./dbConfig');
var express = require('express');
var app = express();
var httpPort = 8080;
var routes = require('./routes.js');
var bodyParser = require('body-parser');

const server = http.createServer();

app.listen(httpPort, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log('server is listening on ${httpPort}');
});


function setupExpress() {
  app.set('view engine', 'jade'); // Set express to use html for rendering HTML
  app.set('views', __dirname + '');
  // Setup the 'public' folder to be statically accessable
  var publicDir = path.join(__dirname, '');
  app.use(express.static(publicDir));
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());

  app.use('/', require('./routes'))

}

setupExpress();


process.on('SIGINT', () => {
    console.log('releasing Oracle pool')
    poolP
    .then(pool => BP.fromNode(cb => pool.terminate(cb)))
    .then(() => process.exit(0), e => {throw e})
})



 /*oracledb.getConnection(
   {
     user          : dbConfig.user,
     password      : dbConfig.password,
     connectString : dbConfig.connectString
   },
   function(err, connection)
   {
     if (err) { console.error("oracle error: "+err); return; }
     connection.execute(
       "SELECT * FROM DISEASE"
     ,
       function(err, result)
       {
         if (err) { console.error(err); return; }
         console.log(result.rows);
       });
   });
*/

