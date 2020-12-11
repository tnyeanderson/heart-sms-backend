var WebSocket = require('ws');
var url = require('url');

var stream = {
    
    ws: null,
    
    clients: {},
    
    subscribeStr: '{"command":"subscribe","identifier":"{\\"channel\\":\\"NotificationsChannel\\"}"}',
    
    identifierStr: '{"channel":"NotificationsChannel"}',
    
    init: function(wsPort) {
        // Set up websockets
        stream.ws = new WebSocket.Server({ port: wsPort, path: '/stream', clientTracking: false });

        stream.startPing();

        stream.ws.on('connection', function connection(ws, req) {
            const parameters = url.parse(req.url, true);
            
            accountId = parameters.query.account_id;
            
            stream.clients[accountId] = ws;
            
            ws.on('message', function incoming(message) {
                console.log('received: %s', message);
                stream.parse(ws, message);
            });

            ws.send(JSON.stringify({
                type: "welcome"
            }));
        });
        
        stream.ws.on('listening', function () {
            console.log("Listening for websocket connections on port " + wsPort);
        });
    },
    
    parse: function (ws, message) {
        if (message == stream.subscribeStr) {
            console.log("SUBSCRIBED");
            stream.confirmSubscription(ws);
        }
        
        stream.sendMessage(ws, {
            youtyped: message
        });
    },
    
    sendMessage: function (ws, message) {
        ws.send(JSON.stringify({
            identifier: stream.identifierStr,
            message: message
        }));
    },
    
    confirmSubscription: function (ws) {
        ws.send(JSON.stringify({
            identifier: stream.identifierStr,
            type: "confirm_subscription"
        }));
    },
    
    broadcast: function (message) {
        Object.values(stream.clients).forEach(ws => {
            ws.send(JSON.stringify(message));
        });
    },
    
    startPing: function () {
        setInterval(stream.sendPing, 1000 * 3);
    },
    
    sendPing: function () {
        stream.broadcast({
            type: "ping",
            message: Math.round(Date.now()/1000)
        });
    }
}

module.exports = stream;
 
