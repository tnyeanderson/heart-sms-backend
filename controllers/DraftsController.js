var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var db = require('../db/query');
var errors = require('../utils/errors');
var stream = require('./StreamController');
var util = require('../utils/util');

var table = "Drafts"

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


router.route('/:deviceConversationId').get(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "SELECT * FROM " + table + " WHERE device_conversation_id = " + mysql.escape(Number(req.params.deviceConversationId)) + " AND " + db.whereAccount(req.query.account_id);
    

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/add').post(function (req, res) {
    if (!req.body.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var cols = ['account_id', 'device_id', 'device_conversation_id', 'mime_type', 'data'];
    var sqls = [];
    
    req.body.drafts.forEach(function (item) {
        var values = [
            mysql.escape(req.body.account_id),
            mysql.escape(item.device_id),
            mysql.escape(item.device_conversation_id),
            mysql.escape(item.mime_type),
            mysql.escape(item.data)
        ];
        sqls.push("INSERT INTO " + table + " (" + cols.join(", ") + ") VALUES (" + values.join(", ") + ")");
    });
        
    db.queries(sqls, res, function (result) {
        res.json({});
        
        // Send websocket message
        req.body.drafts.forEach(function (item) {
            var origKeys = ['device_id', 'device_conversation_id'];
            
            var newKeys = ['id', 'conversation_id'];
            
            var msg = util.renameKeys(item, origKeys, newKeys);
            
            stream.sendMessage(req.body.account_id, 'added_draft', msg);
        });
    });
});


router.route('/remove/:deviceConversationId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sql = "DELETE FROM " + table + " WHERE device_conversation_id = " + mysql.escape(Number(req.params.deviceConversationId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        var msg = {
            id: Number(req.params.deviceConversationId),
            android_device: req.query.android_device
        };
        
        stream.sendMessage(req.body.account_id, 'removed_drafts', msg);
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var toUpdate = {
        data: mysql.escape(req.body.data),
        mime_type: mysql.escape(req.body.mime_type)
    };
    
    var sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(req.query.account_id);

    db.query(sql, res, function (result) {
        res.json({});
        
        // TODO: Send websocket message
    });
});


router.route('/replace/:deviceConversationId').post(function (req, res) {
    if (!req.query.account_id) {
        res.json(errors.invalidAccount);
        return;
    }
    
    var sqls = [];
    
    req.body.drafts.forEach(item => {
        var toUpdate = {
            device_id: mysql.escape(item.device_id),
            device_conversation_id: mysql.escape(item.device_conversation_id),
            mime_type: mysql.escape(item.mime_type),
            data: mysql.escape(item.data)
        };
        
        sqls.push("UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_conversation_id = " + mysql.escape(Number(req.params.deviceConversationId)) + " AND " + db.whereAccount(req.query.account_id));
    });

    db.queries(sqls, res, function (result) {
        res.json({});
        
        // Send websocket message
        req.body.drafts.forEach(function (item) {
            var origKeys = ['device_id', 'device_conversation_id'];
            
            var newKeys = ['id', 'conversation_id'];
            
            var msg = util.renameKeys(item, origKeys, newKeys);
            
            stream.sendMessage(req.body.account_id, 'replaced_drafts', msg);
        });
    });
});

module.exports = router;
 
