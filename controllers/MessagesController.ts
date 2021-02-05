import express from 'express';
import db from '../db/query';
import errors from '../utils/errors';
import stream from './StreamController';
import util from '../utils/util';
import * as MessagesPayloads from '../models/payloads/MessagesPayloads';

const router = express.Router();

const table = 'Messages';

router.route('/').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let limitStr = db.limitStr(Number(req.query.limit), Number(req.query.offset));
    let whereConversationStr = '';
    
    if (req.query.conversation_id) {
        whereConversationStr = " AND device_conversation_id = " + db.escape(Number(req.query.conversation_id));
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

        let payload = new MessagesPayloads.removed_message(
            Number(req.params.deviceId)
        );
        
        // Send websocket message
        stream.sendMessage(accountId, 'removed_message', payload);
    });
});


router.route('/add').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let inserted: any[] = [];
    
    req.body.messages.forEach(function (item: any) {
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
        inserted.forEach(function (item: any) {
            let payload = new MessagesPayloads.added_message(
                item.device_id,
                item.device_conversation_id,
                item.message_type,
                item.data,
                item.timestamp,
                item.mime_type,
                item.read,
                item.seen,
                item.message_from,
                item.color,
                item.sent_device,
                item.sim_stamp
            );
            
            stream.sendMessage(accountId, 'added_message', payload);
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
        let payload = new MessagesPayloads.updated_message(
            Number(req.params.deviceId),
            toUpdate.message_type,
            toUpdate.timestamp,
            toUpdate.read,
            toUpdate.seen
        );
        
        stream.sendMessage(accountId, 'updated_message', payload);
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
        
        let payload = new MessagesPayloads.update_message_type(
            String(req.params.deviceId),
            String(req.query.message_type)
        )

        // Send websocket message
        stream.sendMessage(accountId, 'update_message_type', payload);
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
    
    let sql = `DELETE FROM ${table} WHERE timestamp < ${db.escape(Number(req.query.timestamp))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json({});

        let payload = new MessagesPayloads.cleanup_messages(
            Number(req.query.timestamp)
        )
        
        // Send websocket message
        stream.sendMessage(accountId, 'cleanup_messages', payload);
    });
});


router.route('/forward_to_phone').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let payload = new MessagesPayloads.forward_to_phone(
        String(req.body.to),
        String(req.body.message),
        Number(req.body.sent_device),
        String(req.body.mime_type),
        Number(req.body.message_id)
    );
    
    // Send websocket message
    stream.sendMessage(accountId, 'forward_to_phone', payload);
    
    res.json({});
});

module.exports = router;
 
