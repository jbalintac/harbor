var express = require('express');
var app = express();

app.use(express.static(__dirname + '/app/src/'));
var server = app.listen(80, function(){


	var host = server.address().address;
	var port = server.address().port;
	console.log('harbor listening at http://%s:%s', host, port);
});