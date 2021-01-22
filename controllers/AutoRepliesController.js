const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const db = require('../db/query');
const errors = require('../utils/errors');
const stream = require('./StreamController');
const util = require('../utils/util');

const table = "AutoReplies"

router.route('/').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "SELECT * FROM " + table + " WHERE " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/add').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }

    let inserted = [];
    
    req.body.auto_replies.forEach(function (item) {
        let toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            reply_type: item.reply_type,
            pattern: item.pattern,
            response: item.response
        };
        
        inserted.push(toInsert);
    });

    let sql = "INSERT INTO " + table + db.insertStr(inserted);
        
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            let toKeep = ['device_id', 'reply_type', 'pattern', 'response'];
            
            let msg = util.keepOnlyKeys(item, toKeep);
            
            msg = util.renameKeys(msg, ['reply_type'], ['type']);
            
            stream.sendMessage(accountId, 'added_auto_reply', msg);
        });
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "DELETE FROM " + table + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = {
            id: Number(req.params.deviceId)
        };
        
        stream.sendMessage(accountId, 'removed_auto_reply', msg);
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let toUpdate = {
        reply_type: req.body.type,
        pattern: req.body.pattern,
        response: req.body.response
    };
    
    let sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + mysql.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let toKeep = ['type', 'pattern', 'response'];
            
        let msg = util.keepOnlyKeys(req.body, toKeep);
        
        msg.device_id = req.params.deviceId;
            
        stream.sendMessage(accountId, 'updated_auto_reply', msg);
    });
});

module.exports = router;
 
