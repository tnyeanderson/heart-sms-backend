const express = require('express');
const router = express.Router();
const db = require('../db/query');
const errors = require('../utils/errors');
const stream = require('./StreamController');
const util = require('../utils/util');

const table = 'Messages';

router.route('/').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let limitStr = db.limitStr(req.query.limit, req.query.offset);
    let whereConversationStr = '';
    
    if (req.query.conversation_id) {
        whereConversationStr = " AND device_conversation_id = " + db.escape(req.query.conversation_id);
    }
    
    let sql = `SELECT * FROM ${table} WHERE ${db.whereAccount(accountId)} ${whereConversationStr} ORDER BY timestamp DESC ${limitStr}`;

    db.query(sql, res, function (result) {
        res.json(result);
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        stream.sendMessage(accountId, 'removed_message', {
            id: req.params.deviceId
        });
    });
});


router.route('/add').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let inserted = [];
    
    req.body.messages.forEach(function (item) {
        let toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            device_conversation_id: item.device_conversation_id,
            message_type: item.message_type,
            data: item.data,
            timestamp: item.timestamp,
            mime_type: item.mime_type,
            read: item.read,
            seen: item.seen,
            message_from: item.message_from,
            color: item.color,
            sent_device: item.sent_device,
            sim_stamp: item.sim_stamp
        };

        inserted.push(toInsert);
    });

    let sql = `INSERT INTO ${table} ${db.insertStr(inserted)}`;
        
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            let origKeys = ['device_id', 'device_conversation_id', 'message_type', 'message_from'];
            let replaceWith = ['id', 'conversation_id', 'type', 'from'];
            
            let msg = util.renameKeys(item, origKeys, replaceWith);
            
            delete msg.account_id;
            
            stream.sendMessage(accountId, 'added_message', msg);
        });
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let toUpdate = {
        message_type: req.body.type,
        timestamp: req.body.timestamp,
        read: req.body.read,
        seen: req.body.seen
    };
    
    let sql = `UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = {
            id: Number(req.params.deviceId),
            type: req.body.type,
            timestamp: req.body.timestamp,
            read: req.body.read,
            seen: req.body.seen
        };
        
        stream.sendMessage(accountId, 'updated_message', msg);
    });
});


router.route('/update_type/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.message_type) {
        res.json(errors.missingParam);
        return;
    }
    
    let toUpdate = {
        message_type: req.query.message_type
    };
    
    let sql = `UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        stream.sendMessage(accountId, 'update_message_type', {
            id: req.params.deviceId,
            message_type: Number(req.query.message_type)
        });
    });
});


router.route('/cleanup').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    if (!req.query.timestamp) {
        res.json(errors.missingParam);
        return;
    }
    
    let sql = `DELETE FROM ${table} WHERE timestamp < ${db.escape(req.query.timestamp)} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        stream.sendMessage(accountId, 'cleanup_messages', {
            timestamp: req.query.timestamp
        });
    });
});


router.route('/forward_to_phone').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    delete req.body.account_id;
    
    // Send websocket message
    stream.sendMessage(accountId, 'forward_to_phone', req.body);
    
    res.json({});
});

module.exports = router;
 
