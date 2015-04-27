var express = require('express');
var app = express();

var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 5000;
var dir = process.env.OPENSHIFT_DATA_DIR || __dirname + '/app/src';

app.use(express.static(dir));

var server = app.listen(port, function(){

	var host = server.address().address;
	var port = server.address().port;
	console.log('harbor listening at http://%s:%s', host, port);
});