const express = require('express');
const router = express.Router();
const db = require('../db/query');
const errors = require('../utils/errors');
const stream = require('./StreamController');
const util = require('../utils/util');

const table = "Templates"

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
    
    req.body.templates.forEach(function (item) {
        let toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            text: item.text
        };
        
        inserted.push(toInsert);
    });

    let sql = "INSERT INTO " + table + db.insertStr(inserted);
        
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            delete item.account_id;
            
            stream.sendMessage(accountId, 'added_template', item);
        });
    });
});


router.route('/remove/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = "DELETE FROM " + table + " WHERE device_id = " + db.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);
    

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let msg = {
            id: Number(req.params.deviceId)
        };
        
        stream.sendMessage(accountId, 'removed_template', msg);
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let toUpdate = {
        text: req.body.text
    };
    
    let sql = "UPDATE " + table + " SET " + db.updateStr(toUpdate) + " WHERE device_id = " + db.escape(Number(req.params.deviceId)) + " AND " + db.whereAccount(accountId);

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let toKeep = ['device_id', 'text'];
            
        let msg = {
            device_id: Number(req.params.deviceId),
            text: req.body.text
        };
        
        stream.sendMessage(accountId, 'updated_template', msg);
    });
});

module.exports = router;
 
