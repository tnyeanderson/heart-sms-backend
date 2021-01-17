var app = require('./app');
var StreamController = require('./controllers/StreamController');

// Get ports
var port = process.env.port || 5000;
var wsPort = process.env.wsPort || 5050;

// Override these if we are testing
if (process.env.NODE_ENV === 'test') {
    port = 5001;
    wsPort = 5051
}

var urls = {
    api: "localhost:" + port,
    websocket: "localhost:" + wsPort
}

// Connect to MQTT broker
StreamController.init();

var server = app.listen(port, function () {
    console.log("Server running on port " + port);
});

module.exports = { server, urls };
