const express = require('express');
const router = express.Router();
const db = require('../db/query');
const errors = require('../utils/errors');
const stream = require('./StreamController');
const util = require('../utils/util');

const table = "ScheduledMessages"

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
    
    req.body.scheduled_messages.forEach(function (item) {
        let toInsert = {
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
            
            stream.sendMessage(accountId, 'added_scheduled_message', msg);
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
        
        stream.sendMessage(accountId, 'removed_scheduled_message', msg);
    });
});


router.route('/update/:deviceId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let toUpdate = {
        to: req.body.to,
        data: req.body.data,
        mime_type: req.body.mime_type,
        timestamp: req.body.timestamp,
        title: req.body.title,
        repeat: req.body.repeat
    };
    
    let sql = `UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json({});
        
        // TODO: This is inefficient. but we need the data
        let fields = ["device_id AS id", "to", "data", "mime_type", "timestamp", "title", "repeat"];
        let sql = `SELECT ${db.selectFields(fields)} FROM ${table} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)} LIMIT 1`;
        db.query(sql, res, function (result) {
            stream.sendMessage(accountId, 'updated_scheduled_message', result[0]);
        });
    });
});

module.exports = router;
 
