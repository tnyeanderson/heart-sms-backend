const mqtt = require('mqtt');
const url = require('url');
const db = require('../db/query');
const util = require('../utils/util');
const crypto = require('crypto');

const stream = {
    socket: null,
    topicPrefix: 'heartsms/',
    backendPassword: null,

    init: function () {
        this.backendPassword = (util.env.devOrTest()) ? 'testpassword' : crypto.randomBytes(64).toString('hex');

        let username = 'heart-sms-backend';

        let protocol = (process.env.HEART_USE_SSL === 'true') ? 'mqtts://' : 'mqtt://';
        let url = (process.env.HEART_MQTT_URL) ? process.env.HEART_MQTT_URL : 'localhost';

        console.log("Connecting to " + username + ":" + this.backendPassword + "@" + protocol + url);

        this.socket = mqtt.connect(protocol + url, {
            username: username,
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
        let message = {
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
 
