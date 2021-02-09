import express from 'express';
import db from '../db/query.js';
import stream from './StreamController.js';
import util from '../utils/util.js';
import * as BlacklistsPayloads from '../models/payloads/BlacklistsPayloads.js';
import { BlacklistListResponse } from '../models/responses/BlacklistsResponses.js';
import { BaseResponse } from '../models/responses/BaseResponse.js';
import { BaseRequest } from '../models/requests/BaseRequest.js';


const router = express.Router();

const table = "Blacklists"

router.route('/').get((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `SELECT * FROM ${table} WHERE ${db.whereAccount(accountId)}`;
    

    db.query(sql, res, function (result) {
        res.json(BlacklistListResponse.getList(result));
    });
});


router.route('/add').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);

    let inserted: any[] = [];
    
    req.body.blacklists.forEach(function (item: any) {
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
        res.json(new BaseResponse);
        
        // Send websocket message
        inserted.forEach(function (item: any) {
            let payload = new BlacklistsPayloads.added_blacklist(
                item.device_id,
                item.phone_number,
                item.phrase
            );
            
            stream.sendMessage(accountId, 'added_blacklist', payload);
        });
    });
});


router.route('/remove/:deviceId').post((req, res, next) => BaseRequest.handler(req, res, next), function (req, res) {
    let accountId = util.getAccountId(req);
    
    let sql = `DELETE FROM ${table} WHERE device_id = ${db.escape(Number(req.params.deviceId))} AND ${db.whereAccount(accountId)}`;
    

    db.query(sql, res, function (result) {
        res.json(new BaseResponse);
        
        // Send websocket message
        let payload = new BlacklistsPayloads.removed_blacklist(
            Number(req.params.deviceId)
        );
        
        stream.sendMessage(accountId, 'removed_blacklist', payload);
    });
});

export default router;
 
