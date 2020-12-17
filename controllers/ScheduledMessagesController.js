var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var stream = require('./StreamController');
var util = require('../utils/util');

var table = "ScheduledMessages"

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
    
    var sqls = [];
    var inserted = [];
    
    req.body.scheduled_messages.forEach(function (item) {
        var toInsert = {
            account_id: req.body.account_id,
            device_id: item.device_id,
            to: item.to,
            data: item.data,
            mime_type: item.mime_type,
            timestamp: item.timestamp,
            title: item.title,
            repeat: item.repeat
        };
        
        inserted.push(toInsert);
        
        sqls.push("INSERT INTO " + table + db.insertStr(toInsert));
    });
        
    db.queries(sqls, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            var origKeys = ['device_id'];
            var newKeys = ['id'];
            
            var msg = util.renameKeys(item, origKeys, newKeys);
            
            delete msg.account_id;
            
            stream.sendMessage(req.body.account_id, 'added_scheduled_message', msg);
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
        
        stream.sendMessage(req.body.account_id, 'removed_scheduled_message', msg);
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        to: mysql.escape(req.body.to),
        data: mysql.escape(req.body.data),
        mime_type: mysql.escape(req.body.mime_type),
        timestamp: mysql.escape(req.body.timestamp),
        title: mysql.escape(req.body.title),
        repeat: mysql.escape(req.body.repeat)
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        var msg = util.renameKeys(req.body);
        
        msg.id = Number(req.params.deviceId);
        
        stream.sendMessage(req.body.account_id, 'added_scheduled_message', msg);
    });
});

module.exports = router;
 
