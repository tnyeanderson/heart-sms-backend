var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var stream = require('./StreamController');
var util = require('../utils/util');

var table = 'Messages';

router.route('/').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var limitStr = '';
    var whereConversationStr = '';
    
    if (req.query.conversation_id) {
        whereConversationStr = " AND device_conversation_id = " + mysql.escape(req.query.conversation_id);
    }
    
    if (req.query.limit) {
        limitStr += ' LIMIT ' + req.query.limit;
        if (req.query.offset) {
            limitStr += ' OFFSET ' + req.query.offset;
        }
    }
    
    var sql = "SELECT * FROM " + table + " WHERE " + db.whereAccount(req.query.account_id) + whereConversationStr + limitStr;

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "DELETE FROM " + table + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        stream.sendMessage(req.query.account_id, 'removed_message', {
            id: req.params.deviceId
        });
    });
});


router.route('/add').post(function (req, res) {
    if (!req.body.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['account_id', 'device_id', 'device_conversation_id', 'message_type', '`data`', '`timestamp`', 'mime_type', '`read`', 'seen', 'message_from', 'color', 'sent_device', 'sim_stamp'];
    var sqls = [];
    
    req.body.messages.forEach(function (item) {
        var values = [
            mysql.escape(req.body.account_id),
            mysql.escape(item.device_id),
            mysql.escape(item.device_conversation_id),
            mysql.escape(item.message_type),
            mysql.escape(item.data),
            mysql.escape(item.timestamp),
            mysql.escape(item.mime_type),
            mysql.escape(item.read),
            mysql.escape(item.seen),
            mysql.escape(item.message_from),
            mysql.escape(item.color),
            mysql.escape(item.sent_device),
            mysql.escape(item.sim_stamp)
        ];
        
        sqls.push("INSERT INTO " + table + " (" + cols.join(", ") + ") VALUES (" + values.join(", ") + ")");
    });
        
    db.queries(sqls, res, function (result) {
        res.json({});
        
        // Send websocket message
        req.body.messages.forEach(function (item) {
            var origKeys = ['device_id', 'device_conversation_id', 'message_type', 'message_from'];
            var replaceWith = ['id', 'conversation_id', 'type', 'from'];
            
            var msg = util.renameKeys(item, origKeys, replaceWith);
            
            stream.sendMessage(req.body.account_id, 'added_message', msg);
        });
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        message_type: mysql.escape(req.body.type),
        timestamp: mysql.escape(req.body.timestamp),
        read: mysql.escape(req.body.read),
        seen: mysql.escape(req.body.seen)
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        var msg = {
            id: Number(req.params.deviceId),
            message_type: req.body.type,
            timestamp: req.body.timestamp,
            read: req.body.read,
            seen: req.body.seen
        };
        
        stream.sendMessage(req.query.account_id, 'updated_message', msg);
    });
});


router.route('/update_type/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.message_type) {
        res.json(errors.missingParam);
        return;
    }
    
    var toUpdate = {
        message_type: mysql.escape(req.query.message_type)
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        stream.sendMessage(req.query.account_id, 'update_message_type', {
            id: req.params.deviceId,
            message_type: Number(req.query.message_type)
        });
    });
});


router.route('/cleanup').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.timestamp) {
        res.json(errors.missingParam);
        return;
    }
    
    var sql = "DELETE FROM " + table + " WHERE timestamp < " + mysql.escape(req.query.timestamp) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        stream.sendMessage(req.query.account_id, 'cleanup_messages', {
            timestamp: req.query.timestamp
        });
    });
});


router.route('/forward_to_phone').post(function (req, res) {
    if (!req.body.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var accountId = req.body.account_id;
    
    delete req.body.account_id;
    
    // Send websocket message
    stream.sendMessage(accountId, 'forward_to_phone', req.body);
    
    res.json({});
});

module.exports = router;
 
