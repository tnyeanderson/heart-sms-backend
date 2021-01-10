var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var stream = require('./StreamController');
var util = require('../utils/util');

var table = "ScheduledMessages"

router.route('/').get(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM " + table + " WHERE " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/add').post(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sqls = [];
    var inserted = [];
    
    req.body.scheduled_messages.forEach(function (item) {
        var toInsert = {
            account_id: accountId,
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
            
            stream.sendMessage(accountId, 'added_scheduled_message', msg);
        });
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "DELETE FROM " + table + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        var msg = {
            id: Number(req.params.deviceId)
        };
        
        stream.sendMessage(accountId, 'removed_scheduled_message', msg);
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        to: req.body.to,
        data: req.body.data,
        mime_type: req.body.mime_type,
        timestamp: req.body.timestamp,
        title: req.body.title,
        repeat: req.body.repeat
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // TODO: This is inefficient. but we need the data
        var fields = ["device_id AS id", "to", "data", "mime_type", "timestamp", "title", "repeat"];
        var sql = "SELECT " + db.selectFields(fields) + " FROM " + table + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId) + " LIMIT 1";
        db.query(sql, res, function (result) {
            stream.sendMessage(accountId, 'updated_scheduled_message', result[0]);
        });
    });
});

module.exports = router;
 
