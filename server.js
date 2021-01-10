var app = require('./app');
var StreamController = require('./controllers/StreamController');

// Get ports
var port = process.env.port || 5000;
var wsPort = process.env.wsPort || 5050;

var urls = {
    api: "localhost:" + port,
    websocket: "localhost:" + wsPort
}

// Set up websockets
StreamController.init(wsPort);

var server = app.listen(port, function () {
    console.log("Server running on port " + port);
});

module.exports = { server, urls };
