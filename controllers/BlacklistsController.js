const express = require('express');
const router = express.Router();
const db = require('../db/query');
const errors = require('../utils/errors');
const stream = require('./StreamController');
const util = require('../utils/util');

const table = "Blacklists"

router.route('/').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = `SELECT * FROM ${table} WHERE ${db.whereAccount(accountId)}`;
    

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
    
    req.body.blacklists.forEach(function (item) {
        let toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            phone_number: item.phone_number,
            phrase: item.phrase
        };
        
        inserted.push(toInsert);
    });

    let sql = `INSERT INTO ${table} ${db.insertStr(inserted)}`;
        
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            let origKeys = ['device_id'];
            let newKeys = ['id'];
            
            let msg = util.renameKeys(item, origKeys, newKeys);
            
            delete msg.account_id;
            
            stream.sendMessage(accountId, 'added_blacklist', msg);
        });
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
        let msg = {
            id: Number(req.params.deviceId)
        };
        
        stream.sendMessage(accountId, 'removed_blacklist', msg);
    });
});

module.exports = router;
 
