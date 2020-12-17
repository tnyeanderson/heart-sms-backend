var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var stream = require('./StreamController');
var util = require('../utils/util');

var table = "AutoReplies"

router.route('/').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM " + table + " WHERE " + db.whereAccount(req.query.account_id);
    

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/add').post(function (req, res) {
    if (!req.body.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['account_id', 'device_id', 'reply_type', 'pattern', 'response'];
    var sqls = [];
    
    req.body.auto_replies.forEach(function (item) {
        var values = [
            mysql.escape(req.body.account_id),
            mysql.escape(item.device_id),
            mysql.escape(item.reply_type),
            mysql.escape(item.pattern),
            mysql.escape(item.response)
        ];
        sqls.push("INSERT INTO " + table + " (" + cols.join(", ") + ") VALUES (" + values.join(", ") + ")");
    });
        
    db.queries(sqls, res, function (result) {
        res.json({});
        
        // Send websocket message
        req.body.auto_replies.forEach(function (item) {
            var toKeep = ['device_id', 'type', 'pattern', 'response'];
            
            var msg = util.keepOnlyKeys(item, toKeep);
            
            stream.sendMessage(req.body.account_id, 'added_auto_reply', msg);
        });
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
        var msg = {
            id: Number(req.params.deviceId)
        };
        
        stream.sendMessage(req.body.account_id, 'removed_auto_reply', msg);
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        reply_type: mysql.escape(req.body.type),
        pattern: mysql.escape(req.body.pattern),
        response: mysql.escape(req.body.response)
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);
    

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        var toKeep = ['type', 'pattern', 'response'];
            
        var msg = util.keepOnlyKeys(req.body, toKeep);
        
        msg.device_id = req.params.deviceId;
            
        stream.sendMessage(req.body.account_id, 'added_auto_reply', msg);
    });
});

module.exports = router;
 
