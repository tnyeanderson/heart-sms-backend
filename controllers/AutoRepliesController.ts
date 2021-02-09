import express from 'express';
import db from '../db/query.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as AutoRepliesPayloads from '../models/payloads/AutoRepliesPayloads.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { BasePayload } from '../models/payloads/BasePayload.js';
import { AutoRepliesListResponse } from '../models/responses/AutoRepliesResponses.js';
import { BaseRequest } from '../models/requests/BaseRequest.js';

const router = express.Router();

const table = "AutoReplies"

router.route('/').get((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `SELECT * FROM ${table} WHERE ${db.whereAccount(accountId)}`;
    

    db.query(sql, res, function (result) {
        res.json(AutoRepliesListResponse.getList(result));
    });
});


router.route('/add').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);

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
        res.json(new BaseResponse);
        
        // Send websocket message
        inserted.forEach(function (item) {
            let payload = new AutoRepliesPayloads.added_auto_reply(
                item.device_id,
                item.reply_type,
                item.pattern,
                item.response
            );
            
            stream.sendMessage(accountId, 'added_auto_reply', payload);
        });
    });
});


router.route('/remove/:deviceId').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;
    

    db.query(sql, res, function (result) {
        res.json(new BaseResponse);
        
        // Send websocket message
        let payload = new AutoRepliesPayloads.removed_auto_reply(
            Number(req.params.deviceId)
        );

        stream.sendMessage(accountId, 'removed_auto_reply', payload);
    });
});


router.route('/update/:deviceId').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let toUpdate = {
        reply_type: req.body.type,
        pattern: req.body.pattern,
        response: req.body.response
    };
    
    let sql = `UPDATE ${table} SET ${db.updateStr(toUpdate)} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;
    

    db.query(sql, res, function (result) {
        res.json(new BasePayload);
        
        let payload = new AutoRepliesPayloads.updated_auto_reply(
            Number(req.params.deviceId),
            toUpdate.reply_type,
            toUpdate.pattern,
            toUpdate.response
        );
            
        stream.sendMessage(accountId, 'updated_auto_reply', payload);
    });
});

export default router;
 
