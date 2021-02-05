import express from 'express';
import db from '../db/query';
import errors from '../utils/errors';
import stream from './StreamController';
import util from '../utils/util';
import * as AutoRepliesPayloads from '../models/payloads/AutoRepliesPayloads';

const router = express.Router();

const table = "AutoReplies"

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
    
    req.body.auto_replies.forEach(function (item: any) {
        let toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            reply_type: item.reply_type,
            pattern: item.pattern,
            response: item.response
        };
        
        inserted.push(toInsert);
    });

    let sql = `INSERT INTO ${table} ${db.insertStr(inserted)}`;
        
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item) {
            let payload = new AutoRepliesPayloads.updated_auto_reply(
                item.device_id,
                item.reply_type,
                item.pattern,
                item.response
            );
            
            stream.sendMessage(accountId, 'added_auto_reply', payload);
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
        let payload = new AutoRepliesPayloads.removed_auto_reply(
            Number(req.params.deviceId)
        );

        stream.sendMessage(accountId, 'removed_auto_reply', payload);
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
    
    let sql = `UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;
    

    db.query(sql, res, function (result) {
        res.json({});
        
        let payload = new AutoRepliesPayloads.added_auto_reply(
            Number(req.params.deviceId),
            toUpdate.reply_type,
            toUpdate.pattern,
            toUpdate.response
        );
            
        stream.sendMessage(accountId, 'updated_auto_reply', payload);
    });
});

module.exports = router;
 
