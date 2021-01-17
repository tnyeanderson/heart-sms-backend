var mqtt = require('mqtt');
var url = require('url');
var db = require('../db/query');

var stream = {
    socket: null,
    topicPrefix: 'heartsms/',

    init: function () {
        this.socket = mqtt.connect("mqtt://localhost");
    },
    
    sendMessage: function (accountId, operation, content) {
        var message = {
            operation: operation,
            content: content
        };
        
        this.socket.publish(this.topicPrefix + accountId, JSON.stringify(message), {
            qos: 2
        });
    }
}

module.exports = stream;
 
