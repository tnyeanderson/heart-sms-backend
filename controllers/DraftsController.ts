import express from 'express';
import db from '../db/query.js';
import errors from '../utils/errors.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as DraftsPayloads from '../models/payloads/DraftsPayloads.js';

const router = express.Router();

const table = "Drafts"

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


router.route('/:deviceConversationId').get(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = `SELECT * FROM ${table} WHERE device_conversation_id = ${db.escape(Number(req.params.deviceConversationId))} AND ${db.whereAccount(accountId)}`;
    

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
    
    req.body.drafts.forEach(function (item: any) {
        let toInsert = {
            account_id: accountId,
            device_id: item.device_id,
            device_conversation_id: item.device_conversation_id,
            mime_type: item.mime_type,
            data: item.data
        };
        
        inserted.push(toInsert);
    });

    let sql = `INSERT INTO ${table} ${db.insertStr(inserted)}`;
        
    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        inserted.forEach(function (item: any) {
            let payload = new DraftsPayloads.added_draft(
                item.device_id,
                item.device_conversation_id,
                item.data,
                item.mime_type
            )
            
            stream.sendMessage(accountId, 'added_draft', payload);
        });
    });
});


router.route('/remove/:deviceConversationId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sql = `DELETE FROM ${table} WHERE device_conversation_id = ${db.escape(Number(req.params.deviceConversationId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        let payload = new DraftsPayloads.removed_drafts(
            Number(req.params.deviceConversationId),
            String(req.query.android_device)
        );
        
        stream.sendMessage(accountId, 'removed_drafts', payload);
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
    
    let sql = `UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;

    db.query(sql, res, function (result) {
        res.json({});
        
        // TODO: This is inefficient. but we need all the data
        let fields = ["device_id AS id", "device_conversation_id AS conversation_id", "data", "mime_type"];
        let sql = `SELECT ${db.selectFields(fields)} FROM ${table} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)} LIMIT 1`;
        db.query(sql, res, function (result) {
            let payload = new DraftsPayloads.replaced_drafts(
                result[0].device_id,
                result[0].device_conversation_id,
                result[0].data,
                result[0].mime_type
            );

            stream.sendMessage(accountId, 'replaced_drafts', payload);
        });
    });
});


router.route('/replace/:deviceConversationId').post(function (req, res) {
    let accountId = util.getAccountId(req);
    
    if (!accountId) {
        res.json(errors.invalidAccount);
        return;
    }
    
    let sqls: string[] = [];
    
    req.body.drafts.forEach((item: any) => {
        let toUpdate = {
            device_id: item.device_id,
            device_conversation_id: item.device_conversation_id,
            mime_type: item.mime_type,
            data: item.data
        };
        
        sqls.push(`UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE device_conversation_id = ${db.escape(Number(req.params.deviceConversationId))} AND ${db.whereAccount(accountId)}`);
    });

    let sql = sqls.join(' ');

    db.query(sql, res, function (result) {
        res.json({});
        
        // Send websocket message
        req.body.drafts.forEach(function (item: any) {
            let payload = new DraftsPayloads.replaced_drafts(
                item.device_id,
                item.device_conversation_id,
                item.data,
                item.mime_type
            );
            
            stream.sendMessage(accountId, 'replaced_drafts', payload);
        });
    });
});

export default router;
 
