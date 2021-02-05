import express from 'express';
import db from '../db/query.js';
import errors from '../utils/errors.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as ScheduledMessagesPayloads from '../models/payloads/ScheduledMessagesPayloads.js';

const router = express.Router();

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
    
    let inserted: any[] = [];
    
    req.body.scheduled_messages.forEach(function (item: any) {
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
            let payload = new ScheduledMessagesPayloads.added_scheduled_message(
                item.device_id,
                item.to,
                item.data,
                item.mime_type,
                item.timestamp,
                item.title,
                item.repeat
            );
            
            stream.sendMessage(accountId, 'added_scheduled_message', payload);
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
        let payload = new ScheduledMessagesPayloads.removed_scheduled_message(
            Number(req.params.deviceId)
        );
        
        stream.sendMessage(accountId, 'removed_scheduled_message', payload);
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
            if (result[0]) {
                let payload = new ScheduledMessagesPayloads.updated_scheduled_message(
                    result[0].id,
                    result[0].to,
                    result[0].data,
                    result[0].mime_type,
                    result[0].timestamp,
                    result[0].title,
                    result[0].repeat
                );

                stream.sendMessage(accountId, 'updated_scheduled_message', payload);
            }
        });
    });
});

export default router;
 
