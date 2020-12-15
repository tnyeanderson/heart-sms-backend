var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');

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
    
    var sql = "DELETE FROM " + table + " WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
    });
});


router.route('/add').post(function (req, res) {
    if (!req.body.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['account_id', 'device_id', 'device_conversation_id', 'message_type', 'data', 'timestamp', 'mime_type', 'read', 'seen', 'message_from', 'color', 'sent_device', 'sim_stamp'];
    var sqls = [];
    
    req.body.messages.forEach(function (item) {
        var values = [
            mysql.escape(req.body.account_id),
            mysql.escape(item.device_id),
            mysql.escape(item.device_conversation_id),
            mysql.escape(item.message_type),
            mysql.escape(item.data),
            mysql.escape(item.timstamp),
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
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['message_type', 'timestamp', 'read', 'seen'];
    var values = [
        mysql.escape(req.body.type),
        mysql.escape(req.body.timestamp),
        mysql.escape(req.body.read),
        mysql.escape(req.body.seen)
    ];
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(cols, values) + " WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
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
    
    var cols = ['message_type'];
    var values = [
        mysql.escape(req.query.message_type)
    ];
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(cols, values) + " WHERE device_id = " + mysql.escape(req.params.deviceId) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
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
    });
});

module.exports = router;
 
