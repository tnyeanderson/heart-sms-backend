var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var stream = require('./StreamController');
var util = require('../utils/util');

var table = "AutoReplies"

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

    var inserted = [];
    
    req.body.auto_replies.forEach(function (item) {
        var toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            reply_type: item.reply_type,
            pattern: item.pattern,
            response: item.response
        };
        
        inserted.push(toInsert);
    });

    var sql = "INSERT INTO " + table + db.insertStr(inserted);
        
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            var toKeep = ['device_id', 'reply_type', 'pattern', 'response'];
            
            var msg = util.keepOnlyKeys(item, toKeep);
            
            msg = util.renameKeys(msg, ['reply_type'], ['type']);
            
            stream.sendMessage(accountId, 'added_auto_reply', msg);
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
        
        stream.sendMessage(accountId, 'removed_auto_reply', msg);
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        reply_type: req.body.type,
        pattern: req.body.pattern,
        response: req.body.response
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        var toKeep = ['type', 'pattern', 'response'];
            
        var msg = util.keepOnlyKeys(req.body, toKeep);
        
        msg.device_id = req.params.deviceId;
            
        stream.sendMessage(accountId, 'updated_auto_reply', msg);
    });
});

module.exports = router;
 
