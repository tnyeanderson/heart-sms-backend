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

        console.log("Connecting to MQTT with password: " + this.backendPassword);

        this.socket = mqtt.connect("mqtt://localhost", {
            username: 'heart-sms-backend',
            password: this.backendPassword
        });

        this.socket.on('connect', this.onConnect);
    },

    onConnect() {
        console.log("Connected to MQTT broker");
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
 
