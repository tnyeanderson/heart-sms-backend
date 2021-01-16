var WebSocket = require('ws');
var url = require('url');
var db = require('../db/query');

var stream = {
    
    server: null,
    
    clients: {},

    allowedAccounts: [],
    
    subscribeStr: '{"command":"subscribe","identifier":"{\\"channel\\":\\"NotificationsChannel\\"}"}',
    
    identifierStr: '{"channel":"NotificationsChannel"}',
    
    addClient: function (id, ws) {
        if (!stream.clients[id]) {
            stream.clients[id] = {};
        }
        
        stream.clients[id][ws.clientId] = ws;
    },
    
    removeClient: function (accountId, clientId) {
        var index = -1;
        
        if (!stream.clients[accountId]) {
            return;
        }
        
        if (stream.clients[accountId][clientId]) {
            delete stream.clients[accountId][clientId];
        }
        
        if (!stream.clients[accountId].length) {
            delete stream.clients[accountId];
        }
    },
    
    onboardClient: function (ws) {
        // Generate a clientId if we don't have one
        console.log("Client connected to websocket with id: ", ws.clientId);
        ws.clientId = ws.clientId || Math.floor(Math.random() * 10000);
            
        stream.addClient(ws.accountId, ws);
        
        ws.on('message', function incoming(message) {
            console.log('received: %s', message);
            stream.parse(ws, message);
        });
        
        ws.on('close', function () {
            stream.removeClient(ws.accountId, ws.clientId);
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
            ws.clientId = parameters.query.client_id;
            
            if (process.env.NODE_ENV === 'test' && ws.accountId === 'test') {
                stream.onboardClient(ws);
                return;
            }
            
            // Check the cache to avoid querying the db
            if (stream.allowedAccounts.includes(ws.accountId)) {
                stream.onboardClient(ws);
                return;
            }

            // Query the database to see if the account id is valid
            var sql = "SELECT account_id FROM Accounts WHERE " + db.whereAccount(ws.accountId);
            
            db.query(sql, {}, function (result) {
                if (!result[0]) {
                    console.log("Unrecognized user: ", ws.accountId);
                    return ws.close();
                } else {
                    // Cache the allowed user so we don't constantly query the database
                    stream.allowedAccounts.push(ws.accountId)
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

        var accountClients = stream.clients[accountId];
        
        if (process.env.NODE_ENV === 'test' && stream.clients['test']) {
            Object.values(stream.clients['test']).forEach(ws => {
                ws.send(JSON.stringify(message));
            });
        }
        
        if (!accountClients) {
            return;
        }
        
        Object.values(accountClients).forEach(ws => {
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
            Object.values(connectedClients).forEach(ws => {
                ws.send(JSON.stringify(message));
            });
        });
    },
    
    startPing: function () {
        if (process.env.NODE_ENV === 'test') {
            // Don't send pings if we are testing
            return;
        }
        
        // Send ping every 20 seconds
        setInterval(stream.sendPing, 1000 * 10);
    },
    
    sendPing: function () {
        stream.broadcast({
            type: "ping",
            message: Math.round(Date.now()/1000)
        });
    }
}

module.exports = stream;
 
