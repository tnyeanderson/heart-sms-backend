var mqtt = require('mqtt');
var url = require('url');
var db = require('../db/query');
const crypto = require('crypto');

var stream = {
    socket: null,
    topicPrefix: 'heartsms/',
    backendPassword: null,

    init: function () {
        this.backendPassword = (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test') ? 'testpassword' : crypto.randomBytes(64).toString('hex');

        let url = (process.env.HEART_USE_SSL === 'true') ? 'mqtts://' : 'mqtt://';
        url += (process.env.HEART_MQTT_URL) ? process.env.HEART_MQTT_URL : 'localhost'

        console.log("Connecting to " + url + " with password: " + this.backendPassword);

        this.socket = mqtt.connect(url, {
            username: 'heart-sms-backend',
            password: this.backendPassword
        });

        this.socket.on('connect', this.onConnect);

        this.socket.on('error', this.onError);
    },

    onConnect() {
        console.log("Connected to MQTT broker");
    },

    onError(err) {
        console.log("MQTT error: ", err);
    },
    
    sendMessage: function (accountId, operation, content) {
        var message = {
            operation: operation,
            content: content
        };
        
        if (this.socket) {
            this.socket.publish(this.topicPrefix + accountId, JSON.stringify(message), {
                qos: 2
            });
        } else {
            console.log("Not connected to MQTT, can't send message.");
        }
    }
}

module.exports = stream;
 
