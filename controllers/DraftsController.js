const express = require('express');
const router = express.Router();
const db = require('../db/query');
const errors = require('../utils/errors');
const stream = require('./StreamController');
const util = require('../utils/util');

const table = "Drafts"

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


router.route('/:deviceConversationId').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "SELECT * FROM " + table + " WHERE device_conversation_id = " + db.escape(Number(req.params.deviceConversationId)) + " AND " + db.whereAccount(accountId);
    

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
    
    req.body.drafts.forEach(function (item) {
        let toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            device_conversation_id: item.device_conversation_id,
            mime_type: item.mime_type,
            data: item.data
        };
        
        inserted.push(toInsert);
    });

    let sql = "INSERT INTO " + table + db.insertStr(inserted);
        
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            let origKeys = ['device_id', 'device_conversation_id'];
            let newKeys = ['id', 'conversation_id'];
            
            let msg = util.renameKeys(item, origKeys, newKeys);
            
            delete msg.account_id;
            
            stream.sendMessage(accountId, 'added_draft', msg);
        });
    });
});


router.route('/remove/:deviceConversationId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "DELETE FROM " + table + " WHERE device_conversation_id = " + db.escape(Number(req.params.deviceConversationId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = {
            id: Number(req.params.deviceConversationId),
            android_device: req.query.android_device
        };
        
        stream.sendMessage(accountId, 'removed_drafts', msg);
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    console.log("*************** /drafts/update called!!!!!! **********************");
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let toUpdate = {
        data: req.body.data,
        mime_type: req.body.mime_type
    };
    
    let sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + db.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // TODO: This is inefficient. but we need all the data
        let fields = ["device_id AS id", "device_conversation_id AS conversation_id", "data", "mime_type"];
        let sql = "SELECT " + db.selectFields(fields) + " FROM " + table + " WHERE device_id = " + db.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId) + " LIMIT 1";
        db.query(sql, res, function (result) {
            stream.sendMessage(accountId, 'replaced_drafts', result[0]);
        });
    });
});


router.route('/replace/:deviceConversationId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sqls = [];
    
    req.body.drafts.forEach(item => {
        let toUpdate = {
            device_id: item.device_id,
            device_conversation_id: item.device_conversation_id,
            mime_type: item.mime_type,
            data: item.data
        };
        
        sqls.push("UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_conversation_id = " + db.escape(Number(req.params.deviceConversationId)) + " AND " + db.whereAccount(accountId));
    });

    db.queries(sqls, res, function (result) {
        res.json({});
        
        // Send websocket message
        req.body.drafts.forEach(function (item) {
            let origKeys = ['device_id', 'device_conversation_id'];
            
            let newKeys = ['id', 'conversation_id'];
            
            let msg = util.renameKeys(item, origKeys, newKeys);
            
            stream.sendMessage(accountId, 'replaced_drafts', msg);
        });
    });
});

module.exports = router;
 
