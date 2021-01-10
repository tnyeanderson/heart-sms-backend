var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var stream = require('./StreamController');
var util = require('../utils/util');

var table = "Drafts"

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


router.route('/:deviceConversationId').get(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM " + table + " WHERE device_conversation_id = " + mysql.escape(Number(req.params.deviceConversationId)) + " AND " + db.whereAccount(accountId);
    

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
    
    req.body.drafts.forEach(function (item) {
        var toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            device_conversation_id: item.device_conversation_id,
            mime_type: item.mime_type,
            data: item.data
        };
        
        inserted.push(toInsert);
        
        sqls.push("INSERT INTO " + table + db.insertStr(toInsert));
    });
        
    db.queries(sqls, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            var origKeys = ['device_id', 'device_conversation_id'];
            var newKeys = ['id', 'conversation_id'];
            
            var msg = util.renameKeys(item, origKeys, newKeys);
            
            delete msg.account_id;
            
            stream.sendMessage(accountId, 'added_draft', msg);
        });
    });
});


router.route('/remove/:deviceConversationId').post(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "DELETE FROM " + table + " WHERE device_conversation_id = " + mysql.escape(Number(req.params.deviceConversationId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        var msg = {
            id: Number(req.params.deviceConversationId),
            android_device: req.query.android_device
        };
        
        stream.sendMessage(accountId, 'removed_drafts', msg);
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    var accountId = util.getAccountId(req);
    
    console.log("*************** /drafts/update called!!!!!! **********************");
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        data: req.body.data,
        mime_type: req.body.mime_type
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // TODO: This is inefficient. but we need all the data
        var fields = ["device_id AS id", "device_conversation_id AS conversation_id", "data", "mime_type"];
        var sql = "SELECT " + db.selectFields(fields) + " FROM " + table + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId) + " LIMIT 1";
        db.query(sql, res, function (result) {
            stream.sendMessage(accountId, 'replaced_drafts', result[0]);
        });
    });
});


router.route('/replace/:deviceConversationId').post(function (req, res) {
    var accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sqls = [];
    
    req.body.drafts.forEach(item => {
        var toUpdate = {
            device_id: item.device_id,
            device_conversation_id: item.device_conversation_id,
            mime_type: item.mime_type,
            data: item.data
        };
        
        sqls.push("UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_conversation_id = " + mysql.escape(Number(req.params.deviceConversationId)) + " AND " + db.whereAccount(accountId));
    });

    db.queries(sqls, res, function (result) {
        res.json({});
        
        // Send websocket message
        req.body.drafts.forEach(function (item) {
            var origKeys = ['device_id', 'device_conversation_id'];
            
            var newKeys = ['id', 'conversation_id'];
            
            var msg = util.renameKeys(item, origKeys, newKeys);
            
            stream.sendMessage(accountId, 'replaced_drafts', msg);
        });
    });
});

module.exports = router;
 
