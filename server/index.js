var path = require('path');
var http = require('http');
var connect = require('connect');
var logger = require('morgan');
var serveStatic = require('serve-static');

var api = require('../shared/api');
var Website = require('../shared/Website');

var app = connect();
app.use(logger('dev'));
app.use(Website.connect({api: api}));
app.use(serveStatic(path.join(__dirname, '../client/build')));

var server = http.createServer(app);
var port = parseInt(process.env.PORT, 10) || 3000;
server.listen(port);
server.on('error', function(error){
	throw error;
});
server.on('listening', function(){
	console.log('Listening on port ' + server.address().port);
});