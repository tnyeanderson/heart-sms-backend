var app = require('./app');

var StreamController = require('./controllers/StreamController');

// Get port
var port = process.env.port || 5000;

// Override these if we are testing
if (process.env.NODE_ENV === 'test') {
    port = 5001;
}

var urls = {
    api: "localhost:" + port
}

var server = app.listen(port, function () {
    console.log("Server running on port " + port);

    // Once the server is up so we can authenticate users, connect to the MQTT broker
    StreamController.init();
});

module.exports = { server, urls };
