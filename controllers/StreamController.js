var WebSocket = require('ws');
var url = require('url');
var db = require('../db/query');

var stream = {
    
    server: null,
    
    clients: {},
    
    subscribeStr: '{"command":"subscribe","identifier":"{\\"channel\\":\\"NotificationsChannel\\"}"}',
    
    identifierStr: '{"channel":"NotificationsChannel"}',
    
    addClient: function (id, ws) {
        if (!stream.clients[id]) {
            stream.clients[id] = [];
        }
        
        stream.clients[id].push(ws);
    },
    
    removeClient: function (accountId, connectionId) {
        var index = -1;
        
        if (!stream.clients[accountId]) {
            return;
        }
        
        stream.clients[accountId].forEach(function (ws, i) {
            if (ws.connectionId == connectionId) {
                index = i;
            }
        });
        
        if (index !== -1) {
            stream.clients[accountId].splice(index, 1);
        }
        
        if (!stream.clients[accountId].length) {
            delete stream.clients[accountId];
        }
    },
    
    onboardClient: function (ws) {
        ws.connectionId = Math.floor(Math.random() * 10000);
            
        stream.addClient(ws.accountId, ws);
        
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
            stream.parse(ws, message);
        });
        
        ws.on('close', function () {
            stream.removeClient(ws.accountId, ws.connectionId);
        });

        ws.send(JSON.stringify({
            type: "welcome"
        }));
    },
    
    init: function (wsPort) {
        // Set up websockets
        stream.server = new WebSocket.Server({ port: wsPort, path: '/api/v1/stream', clientTracking: true });

        stream.startPing();

        stream.server.on('connection', function connection(ws, req) {
            const parameters = url.parse(req.url, true);
            
            if (!parameters.query.account_id) {
                ws.close(1008, 'Missing required parameter: account_id');
                return;
            }
            
            ws.accountId = parameters.query.account_id;
            
            if (process.env.NODE_ENV === 'test' && ws.accountId === 'test') {
                stream.onboardClient(ws);
                return;
            }
            
            var sql = "SELECT account_id FROM Accounts WHERE " + db.whereAccount(ws.accountId);
            
            db.query(sql, {}, function (result) {
                if (!result[0]) {
                    console.log("Unrecognized user: ", ws.accountId);
                    return ws.close();
                } else {
                    stream.onboardClient(ws);
                }
            });
            
        });
        
        stream.server.on('listening', function () {
            console.log("Listening for websocket connections on port " + wsPort);
        });
    },
    
    parse: function (ws, message) {
        if (message == stream.subscribeStr) {
            ws.subscribed = true;
            stream.confirmSubscription(ws);
        }
        
        stream.sendMessage(ws, "echo", {
            youtyped: message
        });
    },
    
    sendMessage: function (accountId, operation, content) {
        var message = {
            identifier: stream.identifierStr,
            message: {
                operation: operation,
                content: content
            }
        };
        
        if (process.env.NODE_ENV === 'test' && stream.clients['test']) {
            stream.clients['test'][0].send(JSON.stringify(message));
        }
        
        if (!stream.clients[accountId]) {
            return;
        }
        
        stream.clients[accountId].forEach(function (ws, i) {
            if (ws.subscribed) {
                ws.send(JSON.stringify(message));
            }
        });
    },
    
    confirmSubscription: function (ws) {
        ws.send(JSON.stringify({
            identifier: stream.identifierStr,
            type: "confirm_subscription"
        }));
    },
    
    broadcast: function (message) {
        Object.values(stream.clients).forEach(connectedClients => {
            connectedClients.forEach(ws => {
                ws.send(JSON.stringify(message));
            });
        });
    },
    
    startPing: function () {
        if (process.env.NODE_ENV === 'test') {
            // Don't send pings if we are testing
            return;
        }
        
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
 
