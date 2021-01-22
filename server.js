const app = require('./app');

const StreamController = require('./controllers/StreamController');

// Get port (5000 default, 5001 if testing)
const port = (process.env.NODE_ENV === 'test') ? 5001 : (process.env.port || 5000);

const urls = {
    api: "localhost:" + port
}

const server = app.listen(port, function () {
    console.log("Server running on port " + port);

    // Once the server is up so we can authenticate users, connect to the MQTT broker
    StreamController.init();
});

module.exports = { server, urls };
